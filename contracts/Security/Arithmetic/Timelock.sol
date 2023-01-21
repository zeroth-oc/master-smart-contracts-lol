// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "hardhat/console.sol";

contract Timelock {
  mapping(address => uint256) public balances;
  mapping(address => uint256) public time;

  function deposit() public payable {
    balances[msg.sender] = msg.value;
    time[msg.sender] = block.timestamp + 1 days;
  }

  function increaseTime(uint256 _time) public {
    console.log("Max time", type(uint256).max);
    console.log("Set time", time[msg.sender]);
    console.log("Add time", _time);
    time[msg.sender] += _time;
    console.log("Present time", time[msg.sender]);
  }

  function withdraw() public {
    require(balances[msg.sender] > 0, "Insufficient balance");
    require(block.timestamp > time[msg.sender], "Lock time not completed");

    uint256 amount = balances[msg.sender];
    balances[msg.sender] = 0;
    (bool sent, ) = payable(msg.sender).call{ value: amount }("");
    require(sent, "Withdraw failed");
  }

  function getBalance() public view returns (uint256) {
    return address(this).balance;
  }
}
