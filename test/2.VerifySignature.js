const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Signature Verification", () => {
  let verifySignature;
  let account1, account2;

  beforeEach(async () => {
    [account1, account2] = await ethers.getSigners();
    console.log(account1.address);

    const VerifySignature = await ethers.getContractFactory("VerifySignature");
    verifySignature = await VerifySignature.deploy();
  });

  it("Sign message and verify", async () => {
    let message = "Hello test message";
    let messageHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(message));
    console.log("Message Hash", messageHash);
    let signature = await account1.signMessage(
      ethers.utils.arrayify(messageHash)
    );
    expect(await verifySignature.getSigner(message, signature)).to.be.equal(
      account1.address
    );

    expect(
      await verifySignature.getSigner("Hellotest message", signature)
    ).not.to.be.equal(account1.address);
  });
});
