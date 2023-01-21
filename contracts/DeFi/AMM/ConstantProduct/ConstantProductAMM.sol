// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../../../Common/Math.sol";

interface IERC20 {

    function transfer(address to, uint amount) external returns(bool);

    function transferFrom(address from, address to, uint amount) external returns(bool);

    function balanceOf(address account) external view returns(uint);

}

contract ConstantProductAMM {

    IERC20 public immutable token1;
    IERC20 public immutable token2;
    
    uint public reserve1;
    uint public reserve2;

    uint public totalSupply;
    mapping(address => uint) public balanceOf;

    constructor(IERC20 _token1, IERC20 _token2) {
        token1 = IERC20(_token1);
        token2 = IERC20(_token2);
    }

    function swap(address _tokenIn, uint _amountIn) public returns(uint) {
        
        // Find the tokenIn
        // Receive the tokens
        // Find the amount of tokenOut to given
        // Send the tokenOut

        require(_tokenIn == address(token1) || _tokenIn == address(token2), "Invalid token");
        require(_amountIn > 0, "Invalid amount");

        bool isToken1 = _tokenIn == address(token1);

        (IERC20 tokenIn, IERC20 tokenOut, uint reserveIn, uint reserveOut) = isToken1 
            ? (token1, token2, reserve1, reserve2) 
            : (token2, token1, reserve2, reserve1);

        (bool transferred) = tokenIn.transferFrom(msg.sender, address(this), _amountIn); 
        require(transferred, "Failed to transfer token");

        // Fees is equal to 0.5 %
        uint amountInAfterFees = (_amountIn * 995) / 1000; 

        // dy = Ydx/X+dx;
        uint amountOut;
        amountOut = (reserveOut * amountInAfterFees) / (reserveIn + amountInAfterFees);

        (bool istransferred) = tokenOut.transfer(msg.sender, amountOut);
        require(istransferred, "Failed to transfer token");

        _updateReserves(token1.balanceOf(address(this)), token2.balanceOf(address(this)));

        return amountOut;
    }

    function depositLiquidity(uint _amount1, uint _amount2) external returns(uint) {
        // The ratio X/Y = dx/dy should be maintained
        // Receive the tokens
        // Find the no of shares and mint it.

        require(_amount1 > 0 && _amount2 > 0, "Invalid amount of tokens");
        require((reserve1 * _amount2) == (reserve2 * _amount1), "x/y != dy/dx");

        require(token1.transferFrom(msg.sender, address(this), _amount1), "Failed to receive tokens");
        require(token2.transferFrom(msg.sender, address(this), _amount2), "Failed to receive tokens");

        // s = dxT/X = dyT/Y
        uint shares;
        if(totalSupply == 0){
            shares = Math.sqrt(_amount1 * _amount2);
        } else {
            shares = Math.min((_amount1 * totalSupply) / reserve1, (_amount2 * totalSupply) / reserve2);
        }

        require(shares >  0, "Zero shares are generated ");
        _mint(msg.sender, shares); 
        _updateReserves(token1.balanceOf(address(this)), token2.balanceOf(address(this)));

        return shares;
    }

    function withdrawLiquidity(uint _shares) external returns(uint, uint) {
        // Find the amount of tokens and send them
        // burn the shares

        // dx = sX/T; dy = sY/T; 
        uint token1Amount = (_shares * reserve1) / totalSupply;
        uint token2Amount = (_shares * reserve2) / totalSupply;
        require(token1Amount > 0 && token1Amount > 0, "Either of the tokens to be sent is zero");
        
        _burn(msg.sender, _shares);
        _updateReserves(reserve1 - token1Amount, reserve2 - token2Amount);

        require(token1.transfer(msg.sender, token1Amount), "Failed to send tokens");
        require(token2.transfer(msg.sender, token2Amount), "Failed to send tokens");

        return(token1Amount, token2Amount);
    }

    function _mint(address _to, uint _amount) private {
        balanceOf[_to] += _amount;
        totalSupply += _amount;
    }

    function _burn(address _from, uint _amount) private {
        balanceOf[_from] -= _amount;
        totalSupply -= _amount;
    }

    function _updateReserves(uint _reserve1, uint _reserve2) private {
        reserve1 = _reserve1;
        reserve2 = _reserve2;
    }
}