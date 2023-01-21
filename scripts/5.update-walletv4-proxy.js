const { upgrades } = require("hardhat");

async function main() {
  const WalletV4 = await hre.ethers.getContractFactory("WalletV4");

  const walletV4 = await upgrades.upgradeProxy(
    "0x74fEf48A115021932431BeA96a184b46a4185efa",
    WalletV4
  );

  console.log("Wallet updated to v4");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
