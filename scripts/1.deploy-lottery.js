async function main () {
    const Lottery = await hre.ethers.getContractFactory('MegaLottery');
    const lottery = await Lottery.deploy(10000, 10, 60*60*24*30);

    await lottery.deployed();
    console.log("MegaLottery deployed address - ", lottery.address);
}


main().then(() => {
    process.exit(0)
}).catch((e) => {
    console.log(e)
    process.exit(1);
})