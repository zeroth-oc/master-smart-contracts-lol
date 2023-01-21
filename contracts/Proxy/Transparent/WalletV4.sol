// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

contract WalletV4 {
    uint public cash;
    uint public creditTaken;
    uint public creditGiven;
    
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