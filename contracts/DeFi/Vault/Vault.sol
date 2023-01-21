// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "hardhat/console.sol";

interface IERC20 {

    function transfer(address to, uint amount) external returns(bool);

    function transferFrom(address from, address to, uint amount) external returns(bool);

    function balanceOf(address account) external view returns(uint);

}

contract Vault {

    IERC20 public immutable token;

    uint public totalSupply;

    mapping(address => uint) public balanceOf;

    constructor(IERC20 _token) {
        token = IERC20(_token);
    }

    function deposit(uint _amount) external {
        // s = aT / B

        uint shares;

        if(totalSupply == 0){
            shares = _amount;
        } else {
            shares = ( _amount * totalSupply ) / token.balanceOf(address(this));
        }


        (bool transferred) = token.transferFrom(msg.sender, address(this), _amount);
        require(transferred, "Failed to transfer tokens");
        _mint(msg.sender, shares);
        
    }

    function withdraw(uint _shares) external {
        // a = sB / T
    
        require(balanceOf[msg.sender] >= _shares, "Not enough shares");

        uint amount = (_shares * token.balanceOf(address(this))) / totalSupply;
        (bool transferred) = token.transfer(msg.sender, amount);
        require(transferred, "Failed to transfer tokens");
        _burn(msg.sender, _shares);        
    }
    
    function _mint(address _to, uint _amount) private {
        balanceOf[_to] += _amount;
        totalSupply += _amount;
    }

    function _burn(address _from, uint _amount) private {
        balanceOf[_from] -= _amount;
        totalSupply -= _amount;
    }
}