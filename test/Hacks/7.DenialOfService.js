const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Denial Of Service", () => {
  let king, attacker, account, account1;

  beforeEach(async () => {
    let King = await ethers.getContractFactory("KingContract");
    king = await King.deploy();

    let Attacker = await ethers.getContractFactory("DenialOfService");
    attacker = await Attacker.deploy(king.address);

    [account, account1] = await ethers.getSigners();
  });

  it("King contract works as expected", async () => {
    let previousBalance = await account.getBalance();
    console.log("previousBalance - ", previousBalance);
    await king.claimThrone({ value: ethers.utils.parseEther("100") });
    expect(await king.king()).to.be.equal(account.address);

    await king
      .connect(account1)
      .claimThrone({ value: ethers.utils.parseEther("200") });
    expect(await king.king()).to.be.equal(account1.address);

    let currentBalance = await account.getBalance();
    console.log("currentBalance", currentBalance);
    let expectedBalance = previousBalance.toString().slice(0, 5);
    console.log("expectedBalance", expectedBalance);
    expect(currentBalance.toString().slice(0, 5)).to.be.equal(expectedBalance);
  });

  it("Able to attack", async () => {
    await king.claimThrone({ value: ethers.utils.parseEther("100") });
    expect(await king.king()).to.be.equal(account.address);

    await attacker.attack({ value: ethers.utils.parseEther("110") });
    expect(await king.king()).to.be.equal(attacker.address);

    await expect(
      king.claimThrone({ value: ethers.utils.parseEther("120") })
    ).to.be.revertedWith("Failed to send ether");
  });
});
