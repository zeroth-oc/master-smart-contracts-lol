const { upgrades } = require("hardhat");

async function main() {
  const WalletV3 = await hre.ethers.getContractFactory("WalletV3");

  const walletV3 = await upgrades.upgradeProxy(
    "0x74fEf48A115021932431BeA96a184b46a4185efa",
    WalletV3
  );

  console.log("Wallet updated to v3");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
