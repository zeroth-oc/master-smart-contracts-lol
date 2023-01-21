const {expect} = require("chai");
const { ethers } = require('hardhat');

describe("Reentracy Attack", () => {

    let bank;
    let attacker;
    let account1;
    let account2;

    beforeEach(async () =>{
        let Bank = await ethers.getContractFactory("Bank");
        bank = await Bank.deploy();

        let Attack = await ethers.getContractFactory("Attack");
        attacker = await Attack.deploy(bank.address);

        [account1, account2] = await ethers.getSigners();
    })

    describe("Bank" , () => {
        it("Can deposit amount", async () => {
            expect(await bank.getBalance()).to.be.equal(0);
            await expect(bank.deposit({value : ethers.utils.parseEther("10")})).to.be.ok;
            expect(await bank.getBalance()).to.be.equal(ethers.utils.parseEther("10")); 
        });

        it("Can withdraw amount", async () => {
            let previousBalance = await account1.getBalance();
            console.log("previousBalance - ", previousBalance);
            expect(await bank.deposit({value : ethers.utils.parseEther("10")})).to.be.ok;
            expect(await bank.getBalance()).to.be.equal(ethers.utils.parseEther("10")); 
            expect(await bank.withdraw()).to.be.ok
            
            let currentBalance = await account1.getBalance();
            console.log("currentBalance", currentBalance);
            let expectedBalance = currentBalance.toString().slice(0,5);
            console.log("expectedBalance", expectedBalance);
            expect(currentBalance.toString().slice(0,5)).to.be.equal(expectedBalance);

            expect(await bank.getBalance()).to.be.equal(ethers.utils.parseEther("0")); 
        });
    });

    describe("Attack", () => {

        it("Not Vulnerable to reentrancy with guard", async () => {
            expect(await attacker.getBalance()).to.be.equal(0);
            expect(await bank.connect(account2).deposit({value : ethers.utils.parseEther("10")})).to.be.ok;
            expect(await bank.getBalance()).to.be.equal(ethers.utils.parseEther("10"));

            await expect(attacker.attack({value: ethers.utils.parseEther("1")})).to.be.reverted;

            expect(await bank.getBalance()).to.be.equal(ethers.utils.parseEther("10"));
 
            expect(await attacker.getBalance()).to.be.equal(ethers.utils.parseEther("0"));
        });

        // Works before adding guard

        // it("Vulnerable to reentrancy without guard", async () => {
        //     expect(await attacker.getBalance()).to.be.equal(0);
        //     expect(await bank.connect(account2).deposit({value : ethers.utils.parseEther("10")})).to.be.ok;
        //     expect(await bank.getBalance()).to.be.equal(ethers.utils.parseEther("10"));

        //     expect(await attacker.attack({value: ethers.utils.parseEther("1")})).to.be.ok;

        //     console.log(await bank.getBalance())
        //     console.log(await attacker.getBalance())
        //     expect(await bank.getBalance()).to.be.equal(ethers.utils.parseEther("0"));
 
        //     expect(await attacker.getBalance()).to.be.equal(ethers.utils.parseEther("11"));
        // });
    })

})