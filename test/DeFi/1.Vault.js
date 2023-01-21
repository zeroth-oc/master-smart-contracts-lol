const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Vault", () => {
  let vault, token;
  let account, account1, account2;

  beforeEach(async () => {
    [account, account1, account2] = await ethers.getSigners();
    console.log(account1.address);

    const ERC20Token1 = await ethers.getContractFactory("ERC20Token1");
    token = await ERC20Token1.deploy();

    const Vault = await ethers.getContractFactory("Vault");
    vault = await Vault.deploy(token.address);
  });

  it("Deposit works", async () => {
    expect(await vault.totalSupply()).to.be.equal(0);

    expect(await token.balanceOf(account1.address)).to.be.equal(0);
    await token.mint(account1.address, 10000);
    await token.mint(account2.address, 1000);
    expect(await token.balanceOf(account1.address)).to.be.equal(10000);

    await token.connect(account1).approve(vault.address, 10000);
    await vault.connect(account1).deposit(10000);
    expect(await token.balanceOf(account1.address)).to.be.equal(0);
    console.log(await vault.connect(account1).balanceOf(account1.address));
    expect(
      await vault.connect(account1).balanceOf(account1.address)
    ).to.be.equal(10000);

    await token.connect(account2).approve(vault.address, 1000);
    await vault.connect(account2).deposit(1000);
    expect(await token.balanceOf(account2.address)).to.be.equal(0);
    console.log(await vault.connect(account2).balanceOf(account2.address));
    expect(
      await vault.connect(account2).balanceOf(account2.address)
    ).to.be.equal(1000);
  });

  it("Withdraw works", async () => {
    expect(await vault.totalSupply()).to.be.equal(0);

    await token.mint(account1.address, 10000);
    await token.mint(account2.address, 1000);

    await token.connect(account1).approve(vault.address, 10000);
    await vault.connect(account1).deposit(10000);

    await token.connect(account2).approve(vault.address, 1000);
    await vault.connect(account2).deposit(1000);

    await token.mint(vault.address, 1000);
    await vault.connect(account2).withdraw(1000);
    expect(await vault.balanceOf(account2.address)).to.be.equal(0);
    expect(await token.balanceOf(account2.address)).to.be.equal(1090);

    await vault.connect(account1).withdraw(10000);
    expect(await vault.balanceOf(account1.address)).to.be.equal(0);
    expect(await token.balanceOf(vault.address)).to.be.equal(0);
    console.log(await token.balanceOf(account1.address));
    expect(await token.balanceOf(account1.address)).to.be.equal(10910);
  });

  it("Withdraw issue", async () => {
    expect(await vault.totalSupply()).to.be.equal(0);

    await token.mint(account1.address, 10000);
    await expect(vault.connect(account2).withdraw(1000)).to.be.revertedWith(
      "Not enough shares"
    );
    await token.mint(account2.address, 1000);

    await token.connect(account1).approve(vault.address, 10000);
    await vault.connect(account1).deposit(10000);

    await token.connect(account2).approve(vault.address, 1000);
    await vault.connect(account2).deposit(1000);

    await token.mint(vault.address, 1000);
    expect(await vault.balanceOf(account2.address)).to.be.equal(1000);
    await expect(vault.connect(account2).withdraw(1100)).to.be.revertedWith(
      "Not enough shares"
    );
    expect(await vault.balanceOf(account2.address)).to.be.equal(1000);
    expect(await token.balanceOf(account2.address)).to.be.equal(0);
  });
});
