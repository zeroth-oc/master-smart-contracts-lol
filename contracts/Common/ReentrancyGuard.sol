// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

contract RentrancyGuard {
    bool internal locked;

    modifier noRentrant() {
        require(!locked, "No reentrancy");
        locked = true;
        _;
        locked = false;
    }
}