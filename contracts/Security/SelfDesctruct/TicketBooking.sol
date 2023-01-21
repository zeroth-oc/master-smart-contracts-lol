// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "hardhat/console.sol";

contract TicketBooking {

    uint8 ticketNo = 1;

    mapping (uint => address) public tickets;
    mapping (address => bool) public havePurchased;

    modifier paid(uint _amount) {
        require(_amount == 1 ether, "Need to pay 1 ether");
        _;
    }

    function buyTicket() public payable paid(msg.value) {
        require(address(this).balance <= 10 ether, "Sorry. All tickets sold.");
        tickets[ticketNo] = msg.sender; 
        havePurchased[msg.sender] = true;
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }

    function getAvailableTickets() public view returns(uint){
         if(address(this).balance > 10 ether ){
            return 0;
         } else {
            return (10 ether - address(this).balance) / 1 ether;
         }
    }

}

// Prevention (We should rely on storage instead of address(this).balance)