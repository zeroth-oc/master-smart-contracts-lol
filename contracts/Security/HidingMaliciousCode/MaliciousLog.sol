// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

contract MaliciousLog {
    event LogMessagge1(address _address, string _type, uint amount);

    function log(address _address, string memory _type, uint amount) public {
        emit LogMessagge1(_address, _type, amount);
        // Malicious code
    }
}
