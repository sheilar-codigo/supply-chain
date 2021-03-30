// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.1;

import "./Ownerable.sol";
import "./Item.sol";


contract ItemManager is Ownerable {
    
    struct S_Item {
        Item _item;
        string _itemName;
        uint _itemPrice;
        SupplyChainState _step;
    }
    
    event SupplyChainStepEvent(uint _itemIndex, uint _step, address _itemAddress);
    
    enum SupplyChainState {Created, Paid, Delivered}
    
    uint public itemIndex;
    mapping(uint => S_Item) public suppliedItems;
    
    
    function createItem(string memory _itemName, uint _itemPrice) public onlyOwner {
        Item _item = new Item(this, itemIndex, _itemName, _itemPrice);
        suppliedItems[itemIndex]._item = _item;
        suppliedItems[itemIndex]._itemName = _itemName;
        suppliedItems[itemIndex]._itemPrice = _itemPrice;
        suppliedItems[itemIndex]._step = SupplyChainState.Created;
        emit SupplyChainStepEvent(itemIndex, uint(suppliedItems[itemIndex]._step), address(_item));
        itemIndex ++;
    }
    
    function triggerPayment(uint _index) public payable onlyOwner {
        Item _item = suppliedItems[_index]._item;
        require(_item.priceInWei() == msg.value, "Only full payment is allowed!");
        require(suppliedItems[_index]._step == SupplyChainState.Created, "Item is further in the chain!");
        suppliedItems[_index]._step = SupplyChainState.Paid;
        emit SupplyChainStepEvent(_index, uint(suppliedItems[_index]._step), address(suppliedItems[_index]._item));
    }
    
    function triggerDelivered(uint _index) public onlyOwner {
        require(suppliedItems[_index]._step == SupplyChainState.Paid, "Item is further in the chain!");
        suppliedItems[_index]._step = SupplyChainState.Delivered;
        emit SupplyChainStepEvent(_index, uint(suppliedItems[_index]._step), address(suppliedItems[_index]._item));
    }
    
    function getBalance() external view returns(uint) {
        return address(this).balance;
    }
    
    function getItemCount() external view returns(uint) {
        return itemIndex;
    }
    
    function getItemAddress(uint _index) external view returns(address) {
        return address(suppliedItems[_index]._item);
    }
    
    function getItemStep(uint _index) external view returns(uint) {
        return uint(suppliedItems[_index]._step);
    }
    
    fallback() external payable {
        
    }
    
    receive() external payable {
        
    }
}