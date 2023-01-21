const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Signature Replay", () => {
  let multiSig;
  let account, account1, account2;

  beforeEach(async () => {
    [account, account1, account2] = await ethers.getSigners();

    let MultiSig = await ethers.getContractFactory("MultiSig");
    multiSig = await MultiSig.deploy([account1.address, account2.address]);
  });

  describe("Multi Sig Works", () => {
    it("deposit works", async () => {
      expect(await multiSig.getBalance()).to.be.equal(0);
      await multiSig.deposit({ value: ethers.utils.parseEther("50") });
      expect(await multiSig.getBalance()).to.be.equal(
        ethers.utils.parseEther("50")
      );
    });

    it("transfer works", async () => {
      await multiSig.deposit({ value: ethers.utils.parseEther("50") });

      let messageHash = ethers.utils.solidityKeccak256(
        ["address", "uint"],
        [account1.address.toLowerCase(), ethers.utils.parseEther("10")]
      );
      console.log(messageHash);

      let signature1, signature2;
      signature1 = await account1.signMessage(
        ethers.utils.arrayify(messageHash)
      );
      signature2 = await account2.signMessage(
        ethers.utils.arrayify(messageHash)
      );

      let previousBalance = await account1.getBalance();
      console.log("Previous Balance - ", previousBalance);

      await multiSig.transfer(account1.address, ethers.utils.parseEther("10"), [
        signature1,
        signature2,
      ]);

      let currentBalance = await account1.getBalance();
      console.log("Current Balance - ", currentBalance);
      let expectedBalance = previousBalance
        .add(ethers.utils.parseEther("10"))
        .toString()
        .slice(0, 5);
      expect(currentBalance.toString().slice(0, 5)).to.be.equal(
        expectedBalance
      );
    });

    it("Replay attack", async () => {
      await multiSig.deposit({ value: ethers.utils.parseEther("50") });

      let messageHash = ethers.utils.solidityKeccak256(
        ["address", "uint"],
        [account1.address.toLowerCase(), ethers.utils.parseEther("10")]
      );
      console.log(messageHash);

      let signature1, signature2;
      signature1 = await account1.signMessage(
        ethers.utils.arrayify(messageHash)
      );
      signature2 = await account2.signMessage(
        ethers.utils.arrayify(messageHash)
      );

      let previousBalance = await account1.getBalance();
      console.log("Previous Balance - ", previousBalance);

      await multiSig.transfer(account1.address, ethers.utils.parseEther("10"), [
        signature1,
        signature2,
      ]);
      await multiSig.transfer(account1.address, ethers.utils.parseEther("10"), [
        signature1,
        signature2,
      ]);
      await multiSig.transfer(account1.address, ethers.utils.parseEther("10"), [
        signature1,
        signature2,
      ]);
      await multiSig.transfer(account1.address, ethers.utils.parseEther("10"), [
        signature1,
        signature2,
      ]);
      await multiSig.transfer(account1.address, ethers.utils.parseEther("10"), [
        signature1,
        signature2,
      ]);

      let currentBalance = await account1.getBalance();
      console.log("Current Balance - ", currentBalance);
      let expectedBalance = previousBalance
        .add(ethers.utils.parseEther("50"))
        .toString()
        .slice(0, 5);
      expect(currentBalance.toString().slice(0, 5)).to.be.equal(
        expectedBalance
      );
    });
  });
});

describe("Signature Replay Prevention", () => {
  let multiSig;
  let account, account1, account2;

  beforeEach(async () => {
    [account, account1, account2] = await ethers.getSigners();

    let MultiSig = await ethers.getContractFactory("MultiSigProtected");
    multiSig = await MultiSig.deploy([account1.address, account2.address]);
  });

  describe("Multi Sig Works", () => {
    it("deposit works", async () => {
      expect(await multiSig.getBalance()).to.be.equal(0);
      await multiSig.deposit({ value: ethers.utils.parseEther("50") });
      expect(await multiSig.getBalance()).to.be.equal(
        ethers.utils.parseEther("50")
      );
    });

    it("transfer works", async () => {
      await multiSig.deposit({ value: ethers.utils.parseEther("50") });

      let messageHash = ethers.utils.solidityKeccak256(
        ["address", "uint", "address", "uint"],
        [
          multiSig.address,
          0,
          account1.address.toLowerCase(),
          ethers.utils.parseEther("10"),
        ]
      );
      console.log(messageHash);

      let signature1, signature2;
      signature1 = await account1.signMessage(
        ethers.utils.arrayify(messageHash)
      );
      signature2 = await account2.signMessage(
        ethers.utils.arrayify(messageHash)
      );

      let previousBalance = await account1.getBalance();
      console.log("Previous Balance - ", previousBalance);

      await multiSig.transfer(
        multiSig.address,
        0,
        account1.address,
        ethers.utils.parseEther("10"),
        [signature1, signature2]
      );

      let currentBalance = await account1.getBalance();
      console.log("Current Balance - ", currentBalance);
      let expectedBalance = previousBalance
        .add(ethers.utils.parseEther("10"))
        .toString()
        .slice(0, 5);
      expect(currentBalance.toString().slice(0, 5)).to.be.equal(
        expectedBalance
      );
    });

    it("Replay attack", async () => {
      await multiSig.deposit({ value: ethers.utils.parseEther("50") });

      let messageHash = ethers.utils.solidityKeccak256(
        ["address", "uint", "address", "uint"],
        [
          multiSig.address,
          0,
          account1.address.toLowerCase(),
          ethers.utils.parseEther("10"),
        ]
      );
      console.log(messageHash);

      let signature1, signature2;
      signature1 = await account1.signMessage(
        ethers.utils.arrayify(messageHash)
      );
      signature2 = await account2.signMessage(
        ethers.utils.arrayify(messageHash)
      );

      let previousBalance = await account1.getBalance();
      console.log("Previous Balance - ", previousBalance);

      await multiSig.transfer(
        multiSig.address,
        0,
        account1.address,
        ethers.utils.parseEther("10"),
        [signature1, signature2]
      );
      await expect(
        multiSig.transfer(
          multiSig.address,
          0,
          account1.address,
          ethers.utils.parseEther("10"),
          [signature1, signature2]
        )
      ).to.be.revertedWith("Transaction already executed");

      let currentBalance = await account1.getBalance();
      console.log("Current Balance - ", currentBalance);
      let expectedBalance = previousBalance
        .add(ethers.utils.parseEther("10"))
        .toString()
        .slice(0, 5);
      expect(currentBalance.toString().slice(0, 5)).to.be.equal(
        expectedBalance
      );
    });
  });
});
