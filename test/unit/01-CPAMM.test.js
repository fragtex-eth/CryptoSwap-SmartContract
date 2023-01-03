const { expect } = require("chai");
const { network, deployments, ethers, time } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

let creditA = async function (to, amount) {
  return await tokenContractDeployerA.transfer(to.address, amount);
};

let creditB = async function (to, amount) {
  return await tokenContractDeployerB.transfer(to.address, amount);
};

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Token Unit Tests", function () {
      beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        alice = accounts[1];
        bob = accounts[2];
        charles = accounts[3];
        await deployments.fixture(["all"]);

        tokenContract = await ethers.getContract("CPAMM");
        tokenA = await ethers.getContract("TokenA");
        tokenB = await ethers.getContract("TokenB");

        tokenContract = tokenContract.connect(deployer);
        tokenContractAlice = tokenContract.connect(alice);
        tokenContractBob = tokenContract.connect(bob);
        tokenContractCharles = tokenContract.connect(charles);

        tokenContractDeployerA = tokenA.connect(deployer);
        tokenContractAliceA = tokenA.connect(alice);
        tokenContractBobA = tokenA.connect(bob);
        tokenContractCharlesA = tokenA.connect(charles);

        tokenContractDeployerB = tokenB.connect(deployer);
        tokenContractAliceB = tokenB.connect(alice);
        tokenContractBobB = tokenB.connect(bob);
        tokenContractCharlesB = tokenB.connect(charles);
      });
      describe("CPAMM", function () {
        describe("Initalization()", function () {
          it("Token A correct initalization with correct address", async function () {
            expect(await tokenContract.token0()).to.equal(tokenA.address);
          });
          it("Token B correct initalization with correct address", async function () {
            expect(await tokenContract.token1()).to.equal(tokenB.address);
          });
        });
        describe("Liquidity()", function () {
          beforeEach(async () => {
            //Approving Liquidity
            tokenContractDeployerA.approve(
              tokenContract.address,
              ethers.utils.parseUnits(`${1000000000000}`, 18)
            );
            tokenContractDeployerB.approve(
              tokenContract.address,
              ethers.utils.parseUnits(`${1000000000000}`, 18)
            );
          });
          describe("Adding", function () {
            it("Adding liquidity is possible", async function () {
              await expect(tokenContract.addLiquidity(100, 100)).to.not.be
                .reverted;
            });
            it("Adding liquidity not possible if tokens are not approved", async function () {
              await expect(
                tokenContractAlice.addLiquidity(100, 100)
              ).to.be.revertedWith("ERC20: insufficient allowance");
            });
            it("Adding liquidity not possible if only Token A is approved", async function () {
              tokenContractAliceA.approve(
                tokenContract.address,
                ethers.utils.parseUnits(`${1000000000000}`, 18)
              );
              await expect(
                tokenContractAlice.addLiquidity(100, 100)
              ).to.be.revertedWith("ERC20: insufficient allowance");
            });
            it("Adding liquidity not possible if only Token B is approved", async function () {
              tokenContractAliceB.approve(
                tokenContract.address,
                ethers.utils.parseUnits(`${1000000000000}`, 18)
              );
              await expect(
                tokenContractAlice.addLiquidity(100, 100)
              ).to.be.revertedWith("ERC20: insufficient allowance");
            });
            it("Adding liquidity not possible if insufficient balance both tokens", async function () {
              await tokenContractAliceB.approve(
                tokenContract.address,
                ethers.utils.parseUnits(`${1000000000000}`, 18)
              );
              await tokenContractAliceA.approve(
                tokenContract.address,
                ethers.utils.parseUnits(`${1000000000000}`, 18)
              );
              await expect(
                tokenContractAlice.addLiquidity(100, 100)
              ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
            });
            it("Adding liquidity not possible if insufficient balance Token A", async function () {
              await creditB(alice, 1000);
              await tokenContractAliceB.approve(
                tokenContract.address,
                ethers.utils.parseUnits(`${1000000000000}`, 18)
              );
              await tokenContractAliceA.approve(
                tokenContract.address,
                ethers.utils.parseUnits(`${1000000000000}`, 18)
              );
              await expect(
                tokenContractAlice.addLiquidity(100, 100)
              ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
            });
            it("Adding liquidity not possible if insufficient balance Token B", async function () {
              await creditA(alice, 1000);
              await tokenContractAliceB.approve(
                tokenContract.address,
                ethers.utils.parseUnits(`${1000000000000}`, 18)
              );
              await tokenContractAliceA.approve(
                tokenContract.address,
                ethers.utils.parseUnits(`${1000000000000}`, 18)
              );
              await expect(
                tokenContractAlice.addLiquidity(100, 100)
              ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
            });
            it("Adding liquidity possible if all requirements are met", async function () {
              await creditA(alice, 1000);
              await creditB(alice, 1000);
              await tokenContractAliceB.approve(
                tokenContract.address,
                ethers.utils.parseUnits(`${1000000000000}`, 18)
              );
              await tokenContractAliceA.approve(
                tokenContract.address,
                ethers.utils.parseUnits(`${1000000000000}`, 18)
              );
              await expect(tokenContractAlice.addLiquidity(100, 100)).to.not.be
                .reverted;
            });
          });
        });
        describe("BalanceChange", function () {
          it("Balance updates correctly after adding liquidity", async function () {
            await creditA(alice, 1000);
            await creditB(alice, 1000);
            await tokenContractAliceB.approve(
              tokenContract.address,
              ethers.utils.parseUnits(`${1000000000000}`, 18)
            );
            await tokenContractAliceA.approve(
              tokenContract.address,
              ethers.utils.parseUnits(`${1000000000000}`, 18)
            );
            await tokenContractAlice.addLiquidity(100, 100);
            expect(
              await tokenContractAlice.balanceOf(alice.address)
            ).to.be.equal(100);
            expect(await tokenContractBob.balanceOf(bob.address)).to.be.equal(
              0
            );
          });
        });
      });
    });
