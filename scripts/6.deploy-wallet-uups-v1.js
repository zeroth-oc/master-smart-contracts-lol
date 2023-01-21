async function main () {
    const Wallet = await hre.ethers.getContractFactory('WalletUups');
    const wallet = await Wallet.deploy();

    await wallet.deployed();

    let implementation = wallet.address;

    console.log("Wallet deployed address - ", wallet.address);

    const Proxy = await hre.ethers.getContractFactory('Proxy');
    const proxy = await Proxy.deploy(implementation);
    await proxy.deployed();

    console.log("Wallet proxy address - ", wallet.address);

}


main().then(() => {
    process.exit(0)
}).catch((e) => {
    console.log(e)
    process.exit(1);
})