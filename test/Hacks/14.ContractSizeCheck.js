const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Contract Size Check", () => {
  let noContractAllowed, callProtectedFunction, callProtectedFunction1;
  let account, account1, account2;
  let CallProtectedFunction1;

  beforeEach(async () => {
    [account, account1, account2] = await ethers.getSigners();

    let NoContractAllowed = await ethers.getContractFactory(
      "NoContractAllowed"
    );
    noContractAllowed = await NoContractAllowed.deploy();

    let CallProtectedFunction = await ethers.getContractFactory(
      "CallProtectedFunction"
    );
    callProtectedFunction = await CallProtectedFunction.deploy();

    CallProtectedFunction1 = await ethers.getContractFactory(
      "CallProtectedFunction1"
    );
  });

  describe("Protected Function Checks", () => {
    it("Calling protected function from wallet works", async () => {
      expect(await noContractAllowed.executed()).to.be.equal(false);
      await noContractAllowed.protected();
      expect(await noContractAllowed.executed()).to.be.equal(true);
    });

    it("Calling protected function from contract function doesn't work", async () => {
      expect(await noContractAllowed.executed()).to.be.equal(false);
      await expect(
        callProtectedFunction.protected(noContractAllowed.address)
      ).to.be.revertedWith("Protected from contract");
      expect(await noContractAllowed.executed()).to.be.equal(false);
    });

    it("Calling protected function from contract contructor works", async () => {
      expect(await noContractAllowed.executed()).to.be.equal(false);
      callProtectedFunction1 = await CallProtectedFunction1.deploy(
        noContractAllowed.address
      );
      expect(await noContractAllowed.executed()).to.be.equal(true);
    });
  });
});
