const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HoneyPot - Reentrancy works with code verified", () => {
  let bank;
  let log;
  let attacker;
  let account1;
  let account2;

  beforeEach(async () => {
    let Log = await ethers.getContractFactory("Log1");
    log = await Log.deploy();

    let Bank = await ethers.getContractFactory("Bank3");
    bank = await Bank.deploy(log.address);

    let Attack = await ethers.getContractFactory("Attack6");
    attacker = await Attack.deploy(bank.address);

    [account1, account2] = await ethers.getSigners();
  });

  describe("Bank", () => {
    it("Can deposit amount", async () => {
      expect(await bank.getBalance()).to.be.equal(0);
      expect(await bank.deposit({ value: ethers.utils.parseEther("10") }))
        .to.emit(bank, "LogMessagge")
        .withArgs(account1.address, "deposit", ethers.utils.parseEther("10"));
      expect(await bank.getBalance()).to.be.equal(
        ethers.utils.parseEther("10")
      );
    });

    it("Can withdraw amount", async () => {
      let previousBalance = await account1.getBalance();
      console.log("previousBalance - ", previousBalance);
      expect(await bank.deposit({ value: ethers.utils.parseEther("10") })).to.be
        .ok;
      expect(await bank.getBalance()).to.be.equal(
        ethers.utils.parseEther("10")
      );
      expect(await bank.withdraw())
        .to.emit(bank, "LogMessagge")
        .withArgs(account1.address, "withdraw", ethers.utils.parseEther("10"));

      let currentBalance = await account1.getBalance();
      console.log("currentBalance", currentBalance);
      let expectedBalance = currentBalance.toString().slice(0, 5);
      console.log("expectedBalance", expectedBalance);
      expect(currentBalance.toString().slice(0, 5)).to.be.equal(
        expectedBalance
      );

      expect(await bank.getBalance()).to.be.equal(ethers.utils.parseEther("0"));
    });
  });

  describe("Attack", () => {
    it("Vulnerable to reentrancy without guard", async () => {
      expect(await attacker.getBalance()).to.be.equal(0);
      expect(
        await bank
          .connect(account2)
          .deposit({ value: ethers.utils.parseEther("10") })
      ).to.be.ok;
      expect(await bank.getBalance()).to.be.equal(
        ethers.utils.parseEther("10")
      );

      expect(await attacker.attack({ value: ethers.utils.parseEther("1") })).to
        .be.ok;
      expect(await bank.getBalance()).to.be.equal(ethers.utils.parseEther("0"));
      expect(await attacker.getBalance()).to.be.equal(
        ethers.utils.parseEther("11")
      );
    });
  });
});

describe("HoneyPot", () => {
  let bank;
  let log;
  let attacker;
  let account1;
  let account2;

  beforeEach(async () => {
    let Log = await ethers.getContractFactory("HoneyPot");
    log = await Log.deploy();

    let Bank = await ethers.getContractFactory("Bank3");
    bank = await Bank.deploy(log.address);

    let Attack = await ethers.getContractFactory("Attack6");
    attacker = await Attack.deploy(bank.address);

    [account1, account2] = await ethers.getSigners();
  });

  describe("Bank", () => {
    it("Can deposit amount", async () => {
      expect(await bank.getBalance()).to.be.equal(0);
      expect(await bank.deposit({ value: ethers.utils.parseEther("10") })).to.be
        .ok;
      expect(await bank.getBalance()).to.be.equal(
        ethers.utils.parseEther("10")
      );
    });

    it("Can withdraw amount", async () => {
      expect(await bank.deposit({ value: ethers.utils.parseEther("10") })).to.be
        .ok;
      expect(await bank.getBalance()).to.be.equal(
        ethers.utils.parseEther("10")
      );
      await expect(bank.withdraw()).to.be.revertedWith("You are caught!!!");

      expect(await bank.getBalance()).to.be.equal(
        ethers.utils.parseEther("10")
      );
    });
  });

  describe("Attack", () => {
    it("Vulnerable to reentrancy without guard", async () => {
      expect(await attacker.getBalance()).to.be.equal(0);
      expect(
        await bank
          .connect(account2)
          .deposit({ value: ethers.utils.parseEther("10") })
      ).to.be.ok;
      expect(await bank.getBalance()).to.be.equal(
        ethers.utils.parseEther("10")
      );
      await expect(attacker.attack({ value: ethers.utils.parseEther("1") })).to
        .be.reverted;
      expect(await bank.getBalance()).to.be.equal(
        ethers.utils.parseEther("10")
      );
      expect(await attacker.getBalance()).to.be.equal(
        ethers.utils.parseEther("0")
      );
    });
  });
});
