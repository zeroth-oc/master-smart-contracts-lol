// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import '../../Common/ReentrancyGuard.sol';
import "@openzeppelin/contracts/utils/Address.sol";

contract Log {
   event LogMessagge(address _address, string _type, uint amount);

    function log(address _address, string memory _type, uint amount) public {
        emit LogMessagge(_address, _type, amount);
    }
}

contract Bank1 is RentrancyGuard {

    using Address for address payable;
    mapping(address => uint) balances;
    Log private log;

    constructor(Log _log) {
        log = Log(_log);
    }

    function deposit() public payable {
        require(msg.value > 0, "Insufficient Amount");
        balances[msg.sender] = msg.value;
        log.log(msg.sender, "deposit", msg.value);
    }

    function withdraw() public noRentrant{
        require(balances[msg.sender] >= 0, "Insufficient funds in your account");
        payable(msg.sender).sendValue(balances[msg.sender]);
        log.log(msg.sender, "withdraw", balances[msg.sender]);
        balances[msg.sender] = 0;
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }
}