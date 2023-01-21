// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ExcelAppartment is ERC721 {
     uint counter;
     constructor() ERC721("ExcelAppartment", "EA") {}

     function safeMint(address to) public {
        _safeMint(to, counter);
        ++counter;
     }
}