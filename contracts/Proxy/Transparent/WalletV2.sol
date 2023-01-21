// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

contract WalletV2 {
    uint public cash;

    function initialize(uint _cash) public {
        cash = _cash;
    }

    function add(uint _cash) public {
        cash += _cash;
    }
    
    function remove(uint _cash) public {
        cash -= _cash;
    }
}