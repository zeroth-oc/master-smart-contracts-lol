// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/Address.sol";

contract Log1 {
   event LogMessagge(address _address, string _type, uint amount);

    function log(address _address, string memory _type, uint amount) public {
        emit LogMessagge(_address, _type, amount);
    }
}

contract Bank3 {
    using Address for address payable;
    Log1 private log;

    constructor(Log1 _log) {
        log = Log1(_log);
    }

    mapping(address => uint) balances;

    function deposit() public payable {
        require(msg.value > 0, "Insufficient Amount");
        balances[msg.sender] = msg.value;
        log.log(msg.sender, "deposit", msg.value);
    }

    function withdraw() public{
        require(balances[msg.sender] >= 0, "Insufficient funds in your account");
        payable(msg.sender).sendValue(balances[msg.sender]);
        balances[msg.sender] = 0;
        log.log(msg.sender, "withdraw", balances[msg.sender]);
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }
}