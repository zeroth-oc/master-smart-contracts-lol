// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "hardhat/console.sol";

interface IUniswapV2Router {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    )
        external
        returns (
            uint amountA,
            uint amountB,
            uint liquidity
        );

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns(uint amountA, uint amountB);
}

interface IUniswapV2Factory {
    function getPair(address token0, address token1) external view returns (address);
}

interface IUniswapPair {
    function swap (
        uint amount0Out,
        uint amount1Out,
        address to,
        bytes calldata data
    ) external;
}

interface IUniswapCallee {
    function uniswapV2Call (
        address sender,
        uint amount0,
        uint amount1,
        bytes calldata data
    ) external;
}

interface IERC20 {
    function transferFrom(address from, address to, uint amount) external;

    function transfer(address to, uint amount) external;

    function balanceOf(address account) external view returns(uint) ;

    function approve(address to, uint amount) external returns(bool);

     function allowance(address owner, address spender) external view returns (uint256);
}

interface IWETH is IERC20 {
    function deposit() external payable;

    function withdraw(uint amount) external; 
}

contract UniswapV2Integration is IUniswapCallee {

    address private constant UNISWAP_ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address private constant FACTORY = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    address private constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address private constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address private constant LINK = 0x514910771AF9Ca656af840dff83E8264EcF986CA;

    IUniswapV2Router private router = IUniswapV2Router(UNISWAP_ROUTER);
    IERC20 private weth = IERC20(WETH);
    IERC20 private usdc = IERC20(USDC);
    IERC20 private link = IERC20(LINK);

    IUniswapPair private flashLoanPair;

    function singleSwapExactAmountIn(uint _amountIn, uint _minAmountOut) external returns(uint) {
        weth.transferFrom(msg.sender, address(this), _amountIn);
        weth.approve(address(router), _amountIn);

        address[] memory path = new address[](2);
        path[0] = WETH;
        path[1] = USDC;

        uint[] memory amounts = router.swapExactTokensForTokens(_amountIn, _minAmountOut, path, msg.sender, block.timestamp);

        return amounts[1];

    }

    function multipleSwapExactAmountIn(uint _amountIn, uint _minAmountOut) external returns(uint, uint) {
        usdc.transferFrom(msg.sender, address(this), _amountIn);
        usdc.approve(address(router), _amountIn);

        address[] memory path = new address[](3);
        path[0] = USDC;
        path[1] = WETH;
        path[2] = LINK;

        uint[] memory amounts = router.swapExactTokensForTokens(_amountIn, _minAmountOut, path, msg.sender, block.timestamp);

        return (amounts[1], amounts[2]);
    }

    function singleSwapExactAmountOut(uint _amountOut, uint _amountIn) external returns(uint) {
        weth.transferFrom(msg.sender, address(this), _amountIn);
        weth.approve(address(router), _amountIn);

        address[] memory path = new address[](2);
        path[0] = WETH;
        path[1] = USDC;

        uint[] memory amounts = router.swapTokensForExactTokens(_amountOut, _amountIn, path, msg.sender, block.timestamp);

        if(amounts[0] < _amountIn){
            weth.transfer(msg.sender, _amountIn - amounts[0]);
        }

        return amounts[1];

    }

    function multipleSwapExactAmountOut(uint _amountOut, uint _amountIn) external returns(uint, uint) {
        usdc.transferFrom(msg.sender, address(this), _amountIn);
        usdc.approve(address(router), _amountIn);

        address[] memory path = new address[](3);
        path[0] = USDC;
        path[1] = WETH;
        path[2] = LINK;

        uint[] memory amounts = router.swapTokensForExactTokens(_amountOut, _amountIn, path, msg.sender, block.timestamp);

        if(amounts[0] < _amountIn){
            usdc.transfer(msg.sender, _amountIn - amounts[0]);
        }

        return (amounts[1], amounts[2]);
    }

    function addLiquidity(address _tokenA, address _tokenB, uint _amountA, uint _amountB) 
    external returns (uint, uint, uint) {
        IERC20(_tokenA).transferFrom(msg.sender, address(this), _amountA);
        IERC20(_tokenA).approve(UNISWAP_ROUTER, _amountA);
        
        IERC20(_tokenB).transferFrom(msg.sender, address(this), _amountB);
        IERC20(_tokenB).approve(UNISWAP_ROUTER, _amountB);

        (uint amountA, uint amountB, uint liquidity) = router.addLiquidity(
            _tokenA,
            _tokenB,
            _amountA,
            _amountB,
            1,
            1,
            address(this),
            block.timestamp);

        return (amountA, amountB, liquidity);
    }

    
    function removeLiquidity(address _tokenA, address _tokenB) 
    external returns (uint, uint) {
        address pair = IUniswapV2Factory(FACTORY).getPair(_tokenA, _tokenB);
        uint liquidity = IERC20(pair).balanceOf(address(this));
        IERC20(pair).approve(address(router), liquidity);

        (uint amountA, uint amountB) = router.removeLiquidity(
            _tokenA,
            _tokenB,
            liquidity,
            1,
            1,
            address(this),
            block.timestamp+1000);

        return (amountA, amountB);
    }

    function flashSwap(uint _wEthAmount) external {
        flashLoanPair = IUniswapPair(IUniswapV2Factory(FACTORY).getPair(USDC, WETH));

        bytes memory data = abi.encode(WETH, msg.sender);
        flashLoanPair.swap(0, _wEthAmount, address(this), data);
    }

    function uniswapV2Call(address sender, uint amount0, uint amount1,bytes calldata data) external{
        require(sender == address(this), "Invalid sender");
        require(msg.sender == address(flashLoanPair), "Invalid sender");

        (address tokenBorrow, address caller) = abi.decode(data, (address, address));

        require(tokenBorrow == WETH, "Invalid token received");

        console.log("WETH borrowed - ", amount1);

        uint fee = ((amount1 * 3) / 997) + 1;
        console.log("Fee - ", fee);

        uint amountToRepay = amount1 + fee;
        console.log("Amount to repay - ", amountToRepay);
        console.log("Caller - ", caller);

        weth.transferFrom(caller, address(this), fee);
        weth.transfer(address(flashLoanPair), amountToRepay);
    }

}