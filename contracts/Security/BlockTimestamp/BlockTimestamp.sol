// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "hardhat/console.sol";

contract SpinGame {

    constructor() payable {}

    function spin() external payable {
        require(msg.value == 1 ether);

        console.log("Timestamp - ", block.timestamp);
        require(block.timestamp % 15 == 0, "Sorry better luck next time");

        (bool sent,) = payable(msg.sender).call{value: address(this).balance}("");
        require(sent, "Failed to send ether");
    }

}