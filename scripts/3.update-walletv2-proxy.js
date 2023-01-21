const {upgrades} = require('hardhat')

async function main () {
    const WalletV2 = await hre.ethers.getContractFactory('WalletV2');
    
    const walletV2 = await upgrades.upgradeProxy('0x74fEf48A115021932431BeA96a184b46a4185efa', WalletV2);

    console.log("Wallet updated to v2");
}


main().then(() => {
    process.exit(0)
}).catch((e) => {
    console.log(e)
    process.exit(1);
})