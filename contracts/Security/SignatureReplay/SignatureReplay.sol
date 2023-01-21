// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

contract MultiSig {

    using ECDSA for bytes32;

    address[2] owners;

    constructor(address[2] memory _owners) {
        owners = _owners;
    }

    function deposit() external payable {}

    function transfer(address _to, uint _amount, bytes[2] memory _signatures) public {
        bytes32 messageHash = getMessageHash(_to, _amount);
        require(_verifySignatures(_signatures, messageHash), "Signature verification failed");

        (bool sent, ) = payable(_to).call{value: _amount}("");
        require(sent, "Failed to send ether"); 
    }

    function getMessageHash(address _to, uint _amount) public pure returns(bytes32) {
        return keccak256(abi.encodePacked(_to, _amount));
    }

    function _verifySignatures(bytes[2] memory _signatures, bytes32 _messageHash) private view returns(bool) {
        bytes32 ethSignedMessageHash = _messageHash.toEthSignedMessageHash();

        for(uint8 i=0; i < _signatures.length; i++) {
            address signer = ethSignedMessageHash.recover(_signatures[i]);

            if(!(signer == owners[i])){
                return false;
            }
        }
        return true;
    }

    function getBalance() public view returns(uint){
        return address(this).balance;
    } 
}

contract MultiSigProtected {

    using ECDSA for bytes32;

    address[2] owners;

    mapping(bytes32 => bool) transactionExecuted;

    constructor(address[2] memory _owners) {
        owners = _owners;
    }

    function deposit() external payable {}

    function transfer(address _contractAddress, uint _nounce, address _to, uint _amount, bytes[2] memory _signatures) public {
        bytes32 messageHash = getMessageHash(_contractAddress, _nounce,_to, _amount);
        require(!transactionExecuted[messageHash], "Transaction already executed");
        require(_verifySignatures(_signatures, messageHash), "Signature verification failed");

        transactionExecuted[messageHash] = true;
        (bool sent, ) = payable(_to).call{value: _amount}("");
        require(sent, "Failed to send ether"); 
    }

    function getMessageHash(address _contractAddress, uint _nounce, address _to, uint _amount) public pure returns(bytes32) {
        return keccak256(abi.encodePacked(_contractAddress, _nounce, _to, _amount));
    }

    function _verifySignatures(bytes[2] memory _signatures, bytes32 _messageHash) private view returns(bool) {
        bytes32 ethSignedMessageHash = _messageHash.toEthSignedMessageHash();

        for(uint8 i=0; i < _signatures.length; i++) {
            address signer = ethSignedMessageHash.recover(_signatures[i]);

            if(!(signer == owners[i])){
                return false;
            }
        }
        return true;
    }

    function getBalance() public view returns(uint){
        return address(this).balance;
    } 
}