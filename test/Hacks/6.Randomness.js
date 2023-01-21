let { expect } = require("chai");
let { ethers } = require("hardhat");

describe("Randomess AttacK", () => {
  let random, attacker;

  beforeEach(async () => {
    let Random = await ethers.getContractFactory("Random");
    random = await Random.deploy();

    let Attack = await ethers.getContractFactory("Attack5");
    attacker = await Attack.deploy();
  });

  it("Attack", async () => {
    expect(await attacker.attack(random.address)).to.be.ok;
  });
});
