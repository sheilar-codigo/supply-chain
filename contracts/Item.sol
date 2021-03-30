// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.1;

import "./ItemManager.sol";

contract Item {
    uint public itemIndex;
    string public itemName;
    uint public priceInWei;
    uint public pricePaid;
    ItemManager manager;
    
    constructor(ItemManager _manager, uint _itemIdex, string memory _itemName, uint _priceInWei) {
        manager = _manager;
        itemIndex = _itemIdex;
        itemName = _itemName;
        priceInWei = _priceInWei;
    }

    function getFullItemName() public view returns(string memory) {
        return itemName;
    } 
    
    receive() external payable {
        require(msg.value == priceInWei, "Only full payment is allowed!");
        require(pricePaid == 0, "Item is paid already!");
        (bool success, ) = address(manager).call{value: msg.value}(abi.encodeWithSignature("triggerPayment(uint256)", itemIndex));
        require(success, "Payment wasn't successful!");
    }
}
