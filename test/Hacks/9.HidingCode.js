const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Bank", () => {
  let bank;
  let log;
  let account1;
  let account2;

  beforeEach(async () => {
    [account1, account2] = await ethers.getSigners();

    let Log = await ethers.getContractFactory("Log");
    log = await Log.deploy();

    let Bank = await ethers.getContractFactory("Bank1");
    bank = await Bank.deploy(log.address);
  });

  describe("Bank works", () => {
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
      expect(await bank.deposit({ value: ethers.utils.parseEther("10") })).to.be
        .ok;
      expect(await bank.getBalance()).to.be.equal(
        ethers.utils.parseEther("10")
      );
      expect(await bank.withdraw())
        .to.emit(bank, "LogMessagge")
        .withArgs(account1.address, "withdraw", ethers.utils.parseEther("10"));

      let currentBalance = await account1.getBalance();
      let expectedBalance = currentBalance.toString().slice(0, 5);
      expect(previousBalance.toString().slice(0, 5)).to.be.equal(
        expectedBalance
      );

      expect(await bank.getBalance()).to.be.equal(ethers.utils.parseEther("0"));
    });
  });
});

describe("Bank with malicious Log", () => {
  let bank;
  let maliciousLog;
  let account1;
  let account2;

  beforeEach(async () => {
    [account1, account2] = await ethers.getSigners();

    let MaliciousLog = await ethers.getContractFactory("MaliciousLog");
    maliciousLog = await MaliciousLog.deploy();

    let Bank = await ethers.getContractFactory("Bank1");
    bank = await Bank.deploy(maliciousLog.address);
  });

  describe("Bank works", () => {
    it("Can deposit amount", async () => {
      expect(await bank.getBalance()).to.be.equal(0);
      expect(await bank.deposit({ value: ethers.utils.parseEther("10") }))
        .to.emit(bank, "LogMessagge1")
        .withArgs(account1.address, "deposit", ethers.utils.parseEther("10"));
      expect(await bank.getBalance()).to.be.equal(
        ethers.utils.parseEther("10")
      );
    });

    it("Can withdraw amount", async () => {
      let previousBalance = await account1.getBalance();
      expect(await bank.deposit({ value: ethers.utils.parseEther("10") })).to.be
        .ok;
      expect(await bank.getBalance()).to.be.equal(
        ethers.utils.parseEther("10")
      );
      expect(await bank.withdraw())
        .to.emit(bank, "LogMessagge1")
        .withArgs(account1.address, "withdraw", ethers.utils.parseEther("10"));

      let currentBalance = await account1.getBalance();
      let expectedBalance = currentBalance.toString().slice(0, 5);
      expect(previousBalance.toString().slice(0, 5)).to.be.equal(
        expectedBalance
      );

      expect(await bank.getBalance()).to.be.equal(ethers.utils.parseEther("0"));
    });
  });
});
