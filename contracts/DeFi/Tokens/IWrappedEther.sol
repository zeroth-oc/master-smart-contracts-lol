// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IWrappedEther is IERC20 {
    function deposit() external payable;
    function withdraw() external;
}