async function main () {
    const WalletUupsV2 = await hre.ethers.getContractFactory('WalletUupsV2');
    const walletUupsV2 = await WalletUupsV2.deploy();

    await walletUupsV2.deployed();

    console.log("Wallet deployed address - ", walletUupsV2.address);
}


main().then(() => {
    process.exit(0)
}).catch((e) => {
    console.log(e)
    process.exit(1);
})