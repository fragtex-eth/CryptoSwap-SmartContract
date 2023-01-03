const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  let tokenA, tokenB;
  tokenA = await ethers.getContract("TokenA");
  tokenB = await ethers.getContract("TokenB");
  args = [tokenA.address, tokenB.address];

  const Cpamm = await deploy("CPAMM", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.waitConfirmations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(nftmarketplace.address, args);
  }
  log("----------------------------");
};

module.exports.tags = ["all", "token"];
