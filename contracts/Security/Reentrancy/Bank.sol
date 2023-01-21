// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

import '../../Common/ReentrancyGuard.sol';
import 'hardhat/console.sol';
import "@openzeppelin/contracts/utils/Address.sol";

contract Bank is RentrancyGuard {

    using Address for address payable;

    mapping(address => uint) balances;

    function deposit() public payable {
        require(msg.value > 0, "Insufficient Amount");
        balances[msg.sender] = msg.value;
    }

    function withdraw() public noRentrant{
        console.log("Withdraw called, Bank balance - ", address(this).balance);
        require(balances[msg.sender] >= 0, "Insufficient funds in your account");
        payable(msg.sender).sendValue(balances[msg.sender]);
        balances[msg.sender] = 0;
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }
}