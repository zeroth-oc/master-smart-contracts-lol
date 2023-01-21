const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Denial Of Service", () => {
    
    let wallet;
    let attacker;
    let account1;
    let account2;

    beforeEach(async () =>{
        [account1, account2] = await ethers.getSigners();

        let Wallet = await ethers.getContractFactory("MyWallet");
        wallet = await Wallet.deploy();

        let PhishingAttack = await ethers.getContractFactory("PhishingAttack");
        attacker = await PhishingAttack.connect(account2).deploy(wallet.address);

    })

    describe("Wallet works" , () => {
        it("Can deposit amount", async () => {
            expect(await wallet.balance()).to.be.equal(0);
            expect(await wallet.deposit({value : ethers.utils.parseEther("10")})).to.be.ok;
            expect(await wallet.balance()).to.be.equal(ethers.utils.parseEther("10")); 
        });

        it("Can withdraw amount", async () => {
            let previousBalance = await account1.getBalance();
            expect(await wallet.deposit({value : ethers.utils.parseEther("10")})).to.be.ok;
            expect(await wallet.balance()).to.be.equal(ethers.utils.parseEther("10")); 
            expect(await wallet.withdraw(account1.address)).to.be.ok
            
            let currentBalance = await account1.getBalance();
            let expectedBalance = currentBalance.toString().slice(0,5);
            expect(previousBalance.toString().slice(0,5)).to.be.equal(expectedBalance);

            expect(await wallet.balance()).to.be.equal(ethers.utils.parseEther("0")); 
        });
    });

    it("Able to attack", async () => {

        expect(await wallet.deposit({value : ethers.utils.parseEther("10")})).to.be.ok;
        expect(await wallet.balance()).to.be.equal(ethers.utils.parseEther("10")); 

        expect(await attacker.connect(account1).attack()).to.be.ok;
        expect(await wallet.balance()).to.be.equal(ethers.utils.parseEther("0")); 



    });

})