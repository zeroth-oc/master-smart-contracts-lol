// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

contract Wallet {
    uint public cash;

    function initialize(uint _cash) public{
        cash = _cash;
    }
}