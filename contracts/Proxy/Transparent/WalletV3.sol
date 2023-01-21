// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

contract WalletV3 {
    uint public cash;
    uint public creditTaken;
    uint public creditGiven;

    function initialize(uint _cash) public {
        cash = _cash;
    }

    function add(uint _cash) public {
        cash += _cash;
    }
    
    function sub(uint _cash) public {
        cash -= _cash;
    }

    function addCreditTaken(uint _credit) public {
        creditTaken += _credit;
    }
    
    function subaddCreditTaken(uint _credit) public {
        creditTaken -= _credit;
    }

    function addCreditGiven(uint _credit) public {
        creditGiven += _credit;
    }
    
    function subaddCreditGiven(uint _credit) public {
        creditGiven -= _credit;
    }
}