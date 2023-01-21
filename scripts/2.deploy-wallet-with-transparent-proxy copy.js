const {upgrades} = require('hardhat')

async function main () {
    const Wallet = await hre.ethers.getContractFactory('Wallet');
    
    const wallet = await upgrades.deployProxy(Wallet,[100], {
        initializer: 'initialize'
    })

    await wallet.deployed();

    console.log("Wallet proxy address - ", wallet.address);
}


main().then(() => {
    process.exit(0)
}).catch((e) => {
    console.log(e)
    process.exit(1);
})