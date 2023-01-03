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

        tokenContract = await tokenContract.connect(deployer);
        tokenContractAlice = await tokenContract.connect(alice);
        tokenContractBob = await tokenContract.connect(bob);
        tokenContractCharles = await tokenContract.connect(charles);

        tokenContractDeployerA = await tokenA.connect(deployer);
        tokenContractAliceA = await tokenA.connect(alice);
        tokenContractBobA = await tokenA.connect(bob);
        tokenContractCharlesA = await tokenA.connect(charles);

        tokenContractDeployerB = await tokenB.connect(deployer);
        tokenContractAliceB = await tokenB.connect(alice);
        tokenContractBobB = await tokenB.connect(bob);
        tokenContractCharlesB = await tokenB.connect(charles);
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
          describe("Share Balance Change", function () {
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
            it("Balance updates correctly after removing liquidity", async function () {
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
              await tokenContractAlice.removeLiquidity(7);
              expect(
                await tokenContractAlice.balanceOf(alice.address)
              ).to.be.equal(93);
            });
          });
        });
        describe("Swap()", function () {
          beforeEach(async () => {
            //Adding Liquidity Alice & Bob
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
            await tokenContractAlice.addLiquidity(1000, 1000);
            await creditA(bob, 1000);
            await creditB(bob, 1000);
            await tokenContractBobB.approve(
              tokenContract.address,
              ethers.utils.parseUnits(`${1000000000000}`, 18)
            );
            await tokenContractBobA.approve(
              tokenContract.address,
              ethers.utils.parseUnits(`${1000000000000}`, 18)
            );
            await tokenContractBob.addLiquidity(250, 250);
          });
          it("Swap is not possible if token not approved", async function () {
            await expect(
              tokenContractCharles.swap(tokenA.address, 10)
            ).to.be.revertedWith("ERC20: insufficient allowance");
          });
          it("Swap is not possible if token not enough balance", async function () {
            await tokenContractCharlesA.approve(
              tokenContract.address,
              ethers.utils.parseUnits(`${1000000000000}`, 18)
            );
            await expect(
              tokenContractCharles.swap(tokenA.address, 10)
            ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
          });
          it("Swap successfully and correctly executed if prerequisit is met correct", async function () {
            await creditA(charles, 1000);
            await tokenContractCharlesA.approve(
              tokenContract.address,
              ethers.utils.parseUnits(`${1000000000000}`, 18)
            );
            let balanceA1 = await tokenContractDeployerA.balanceOf(
              charles.address
            );
            let balanceB1 = await tokenContractDeployerB.balanceOf(
              charles.address
            );
            await tokenContractCharles.swap(tokenA.address, 100);
            let balanceA2 = await tokenContractDeployerA.balanceOf(
              charles.address
            );
            let balanceB2 = await tokenContractDeployerB.balanceOf(
              charles.address
            );

            expect(balanceA1).to.equal(balanceA2.add(100));
            expect(balanceB1).to.equal(balanceB2.sub(91)); //Slippage
          });
          it("Removed liquidity balance updates correctly after swap", async function () {
            await creditA(charles, 1000);
            await tokenContractCharlesA.approve(
              tokenContract.address,
              ethers.utils.parseUnits(`${1000000000000}`, 18)
            );
            await tokenContractCharles.swap(tokenA.address, 100);
            let balanceAbefore = await tokenContractDeployerA.balanceOf(
              alice.address
            );
            let balanceBbefore = await tokenContractDeployerB.balanceOf(
              alice.address
            );
            await tokenContractAlice.removeLiquidity(100);
            let balanceAafter = await tokenContractDeployerA.balanceOf(
              alice.address
            );
            let balanceBafter = await tokenContractDeployerB.balanceOf(
              alice.address
            );
            expect(balanceAbefore).to.equal(balanceAafter.sub(108));
            expect(balanceBbefore).to.equal(balanceBafter.sub(92)); //Slippage
          });
        });
      });
    });
