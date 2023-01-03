const { network } = require("hardhat");
const { tokenConfig, token2Config } = require("../hardhat-token-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const chainId = network.config.chainId;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  args = [tokenConfig.name, tokenConfig.symbol, tokenConfig.initialSupply];
  args2 = [token2Config.name, token2Config.symbol, token2Config.initialSupply];

  const token = await deploy("TokenA", {
    from: deployer,
    args: args,
    log: true,
    contract: "ERCToken",
    waitConfirmations: network.config.waitConfirmations || 1,
  });
  const token2 = await deploy("TokenB", {
    from: deployer,
    args: args2,
    log: true,
    contract: "ERCToken",
    waitConfirmations: network.config.waitConfirmations || 1,
  });
  const token3 = await deploy("TokenC", {
    from: deployer,
    args: args2,
    log: true,
    contract: "ERCToken",
    waitConfirmations: network.config.waitConfirmations || 1,
  });
};

module.exports.tags = ["all", "mock"];
