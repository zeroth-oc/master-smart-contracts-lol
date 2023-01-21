// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

contract Ownable {
    address private _owner;

    constructor(){
        _owner = msg.sender;
    }

    modifier onlyOwner(){
        require(msg.sender == _owner, "Permission Denied");
        _;
    }

    modifier notOwner() {
        require(msg.sender != _owner, "Permission Denied");
        _;
    }

    function owner() public view returns(address){
        return _owner;
    }
}