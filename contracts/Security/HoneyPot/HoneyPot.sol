// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

contract HoneyPot {
    function log(address _address, string memory _type, uint amount) public {
        if(compareStrings(_type, "withdraw")){
            revert("You are caught!!!");
        }        
    }

    function compareStrings(string memory a, string memory b) public pure returns (bool) {
       return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
}
