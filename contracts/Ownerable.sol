// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.1;

contract Ownerable {
    address payable owner;
    constructor() {
        owner = payable(msg.sender);
    }
    
    function isOwner() public view returns (bool) {
        return msg.sender == owner;
    }
    
    modifier onlyOwner {
        require(isOwner(), "You are not the owner!");
        _;
    }
}