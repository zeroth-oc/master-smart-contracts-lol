// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

contract NoContractAllowed {

    bool public executed = false;
    
    function isContract(address account) internal view returns(bool){
        uint size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }

    modifier noContract {
        require(!isContract(msg.sender), "Protected from contract");
        _;
    }

    function protected() public noContract {
        executed = true;
    }
}

contract CallProtectedFunction {
    function protected(address _target) public{
        NoContractAllowed(_target).protected();
    }
}

contract CallProtectedFunction1 {

    constructor(address _target){
        NoContractAllowed(_target).protected();
    }
}