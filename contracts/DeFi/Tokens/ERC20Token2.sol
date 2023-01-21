// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20Token2 is ERC20, Ownable {
    
    constructor() ERC20("Token2", "T2") {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

}