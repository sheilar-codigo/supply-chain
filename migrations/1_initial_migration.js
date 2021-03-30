var Migrations = artifacts.require("./ItemManager.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
