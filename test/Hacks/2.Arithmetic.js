const {expect} = require("chai");
const { ethers } = require('hardhat');
const { mine } = require("@nomicfoundation/hardhat-network-helpers");


describe("Arithmetic Overflow Underflow Attack", () => {

    let timelock;
    let attacker;
    let account;

    beforeEach(async () =>{
        let Timelock = await ethers.getContractFactory("Timelock");
        timelock = await Timelock.deploy();

        let Attack = await ethers.getContractFactory("Attack2");
        attacker = await Attack.deploy(timelock.address);

        account = await ethers.getSigner();
    })

    describe("Timelock" , () => {
        it("Can deposit amount", async () => {
            expect(await timelock.getBalance()).to.be.equal(0);
            expect(await timelock.deposit({value : ethers.utils.parseEther("10")})).to.be.ok;
            expect(await timelock.getBalance()).to.be.equal(ethers.utils.parseEther("10"));
            expect(await timelock.balances(account.address)).to.be.equal(ethers.utils.parseEther("10")); 
        });

        it("Can withdraw amount", async () => {
            let previousBalance = await account.getBalance();
            console.log("previousBalance - ", previousBalance);
            expect(await timelock.deposit({value : ethers.utils.parseEther("10")})).to.be.ok;
            expect(await timelock.getBalance()).to.be.equal(ethers.utils.parseEther("10")); 
            await expect(timelock.withdraw()).to.be.revertedWith("Lock time not completed");
            
            await mine(100000);

            expect(await timelock.withdraw()).to.be.ok;

            let currentBalance = await account.getBalance();
            console.log("currentBalance", currentBalance);
            let expectedBalance = previousBalance.toString().slice(0,5);
            console.log("expectedBalance", expectedBalance);
            expect(currentBalance.toString().slice(0,5)).to.be.equal(expectedBalance);

            expect(await timelock.getBalance()).to.be.equal(ethers.utils.parseEther("0")); 
        });
    });

    describe("Attack", () => {
        it("Overflow error", async () => {
            await expect(attacker.attack({value: ethers.utils.parseEther("10")})).to.be.reverted;
        });
    })

})