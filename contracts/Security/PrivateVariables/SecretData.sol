// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

contract SecretData {

    uint public data1 = 123;

    uint private data2 = 324;

    bytes32 private secret = "Secret data";

    string private secret1 = "Secret data1";

    bool private hacked = true;

    uint16 private data3 = 100;
}