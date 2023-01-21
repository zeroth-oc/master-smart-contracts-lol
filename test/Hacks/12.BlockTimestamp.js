const { expect } = require("chai");
const { ethers } = require("hardhat");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");

describe("Block Timestamp", () => {
  let spinGame;
  let account;

  beforeEach(async () => {
    let SpinGame = await ethers.getContractFactory("SpinGame");
    spinGame = await SpinGame.deploy({ value: ethers.utils.parseEther("1") });

    account = await ethers.getSigner();
  });

  describe("Spin Game works", () => {
    it("Spin", async () => {
      let loop = true;
      while (loop) {
        let block = await ethers.provider.getBlockNumber();
        let blockTimestamp =
          (await ethers.provider.getBlock(block)).timestamp + 1;
        console.log("Block - ", block);
        console.log("Block TimeStamp - ", blockTimestamp);
        console.log("Divisible by 15 - ", blockTimestamp % 15 == 0);
        console.log("");

        if (blockTimestamp % 15 == 0) {
          expect(await spinGame.spin({ value: ethers.utils.parseEther("1") }))
            .to.be.ok;
          loop = false;
        }
        await mine(1);
      }
    });
  });
});
