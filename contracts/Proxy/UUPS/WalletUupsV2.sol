// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import './Proxiable.sol';

contract WalletUupsV2 is Proxiable {
    address private owner;
    uint public cash;
    bool public initialized = false;

    modifier onlyOnwer() {
        require(msg.sender == owner, "Permission Denied");
        _;
    }

    modifier notInitialised(){
        require(!initialized, "Permission Denied");
        _;
    }

    function add(uint _cash) public {
        cash += _cash;
    }

    function sub(uint _cash) public {
        cash -= _cash;
    }

    function upgrateTo(address _implementation) public onlyOnwer{
        _upgrateTo(_implementation);
    }
}