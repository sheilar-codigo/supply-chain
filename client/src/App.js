import React, { Component } from "react";
import ItemManager from "./contracts/ItemManager.json";
import Item from "./contracts/Item.json";
import getWeb3 from "./getWeb3";

import "./App.css";


class App extends Component {
  
  state = { loaded: false, itemName: "", itemPrice: 0, items: [] };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      
      this.itemManager = new web3.eth.Contract(
        ItemManager.abi,
        ItemManager.networks[networkId] && ItemManager.networks[networkId].address,
      );

      this.item = new web3.eth.Contract(
        Item.abi,
        Item.networks[networkId] && Item.networks[networkId].address,
      );

      
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.fetchAllItems()
      this.listenToEvents()
      this.setState({ loaded: true });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type == "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    })
  };

  handleSubmit = async() => {
    const {itemName, itemPrice} = this.state;
    console.log(itemName)
    console.log(itemPrice)
    await this.itemManager.methods.createItem(itemName, itemPrice).send({from: this.accounts[0]});
  };

  handlePayment = async(event) => {
    const itemIndex = event.target.value;
    const item = this.state.items[itemIndex]
    console.log("Payment: " + itemIndex)
    await this.itemManager.methods.triggerPayment(itemIndex).send({from: this.accounts[0], value: item.price});
  };

  handleDelivery = async(event) => {
    const itemIndex = event.target.value;
    const item = this.state.items[itemIndex]
    console.log("Delivery: " + itemIndex)
    await this.itemManager.methods.triggerDelivered(itemIndex).send({from: this.accounts[0]});
  };

  fetchAllItems = async() => {
      let total = await this.itemManager.methods.itemIndex().call();
      console.log("Total Supplied Items: " + total);
      for (var i = 0; i < total; i++) {
        let suppliedItem = await this.itemManager.methods.suppliedItems(i).call();
        
        console.log(suppliedItem[0].toString());
        var itemName  = suppliedItem[1];
        var itemPrice = suppliedItem[2];
        var step = suppliedItem[3];
        var stepText = "";
        if (step == 0) {
          stepText = "Created";
        } else if (step == 1) {
          stepText = "Paid";
        } else {
          stepText = "Delivered";
        }

        console.log("Item: " + itemName + " => " + itemPrice);
        this.state.items.push({"name": itemName, "price": itemPrice, "step": stepText})
        this.setState({items: this.state.items});
      }
  };

  listenToEvents = () => {
    let self = this;
    this.itemManager.events.SupplyChainStepEvent().on("data", async function(event) {
      console.log("Item index: " + event.returnValues._itemIndex);
      let itemIndex = event.returnValues._itemIndex;
      let item = await self.itemManager.methods.suppliedItems(itemIndex).call();
      let itemName = item._itemName;
      let itemPrice = item._itemPrice;
      let step = event.returnValues._step;

      console.log("Item: " + item._item);

      if (event.returnValues._step == 0) { // created
        alert("Item " + itemIndex + " is created!");
        self.state.items.push({"name": itemName, "price": itemPrice, "step": "Created"})
      } else if (event.returnValues._step == 1) { // paid
        alert("Item " + itemIndex + " was paid, deliver it now!");
        self.state.items[itemIndex].step = "Paid";
      } else { // delivered
        alert("Item " + itemIndex + " was delivered!");
        self.state.items[itemIndex].step = "Delivered";
      }
      self.setState({items: self.state.items});
      console.log(event);
    })
  };

  renderTable() {
    return (
      <table border="1" color = "black" align = "center">
          <thead>
            <tr>
              <th ><b>No.</b></th>
              <th ><b>Item Name</b></th>
              <th ><b>Price in Wei</b></th>
              <th ><b>Supply Chain Step</b></th>
              <th ><b>Trigger Payment</b></th>
              <th ><b>Trigger Delivery</b></th>
            </tr>
          </thead>
          <tbody>
            { 
              this.state.items.map((item, index) => 
              <tr>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.price}</td>
                <td>{item.step}</td>
                <td><input type='checkbox' value = {index} onChange={this.handlePayment} checked = {item.step == "Paid" || item.step == "Delivered" ? "checked" : ""}/></td>
                <td><input type='checkbox' value = {index} onChange={this.handleDelivery} checked = {item.step == "Delivered" ? "checked" : ""}/></td>
              </tr>
              )
            }
          </tbody>
      </table> 
    );
  }

  render() {
    if (!this.state.loaded) {
      return <div> Loading web3, accounts and contract...</div>;
    }

    return (
      <div className = "App">
        <h1>Event Trigger / Supply Chain Example</h1>
        <h2> Items </h2>
        {this.renderTable()}
        <br></br>
        <h2> Add New Item </h2>
        <table border="1" color = "black" align = "center">
          <tr>
            <td>Item Name:</td>
            <td><input type = "text" name = "itemName" value = {this.state.itemName} onChange={this.handleInputChange}/></td>
          </tr>
          <tr>
            <td>Item Price:</td>
            <td><input type = "text" name = "itemPrice" value = {this.state.itemPrice} onChange={this.handleInputChange}/></td>
          </tr>
          <tr>
            <td rowSpan = "2"><button onClick = {this.handleSubmit}>Create</button></td>
          </tr>
        </table>
         
        
        
        <br></br>
      </div>
    );
  }
}

export default App;
