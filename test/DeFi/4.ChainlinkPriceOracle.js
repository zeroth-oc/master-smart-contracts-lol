const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Chainlink", () => {
  let ethPriceOracle, btcPriceOracle;

  beforeEach(async () => {
    const EthPriceOracle = await ethers.getContractFactory(
      "ChainlinkPriceOracle"
    );
    ethPriceOracle = await EthPriceOracle.deploy(
      "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
    );
    console.log(ethPriceOracle.address);

    const BtcPriceOracle = await ethers.getContractFactory(
      "ChainlinkPriceOracle"
    );
    btcPriceOracle = await BtcPriceOracle.deploy(
      "0xA39434A63A52E749F02807ae27335515BA4b07F7"
    );
  });

  it("Price Oracle Works", async () => {
    let price = await ethPriceOracle.getLatestPrice();
    console.log(price);
    console.log(await btcPriceOracle.getLatestPrice());
  });
});
