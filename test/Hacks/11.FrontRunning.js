const {expect} = require("chai");
const {ethers} = require('hardhat');

describe("Front Running - Vulnerable", () => {

    let solveHash;
    let hash;
    let account1;
    let account2;

    beforeEach(async () => {
        let SolveHash = await ethers.getContractFactory("SolveHash");
        solveHash = await SolveHash.deploy({value: ethers.utils.parseEther("1")});

        [account1, account2] = await ethers.getSigners();
        hash = await solveHash.hashString();
    });

    describe("Solve hash works properly", () => {

        it("Guess Hash", async () => {
            await expect(solveHash.solve("test")).to.be.rejectedWith("Incorrect guess");

            let previousBalance = await account1.getBalance();
            expect(await solveHash.solve("Gowtham is a smart contract master")).to.be.ok;
            let currentBalance = await account1.getBalance();
            let expectedBalance = previousBalance.add(ethers.utils.parseEther("1")).toString().slice(0,5);
            expect(currentBalance.toString().slice(0,5)).to.be.equal(expectedBalance);
        })

    });

});

describe("Front Running - Using Commit Reveal as prevention", () => {

    let solveHash;
    let hash;
    let account1;
    let account2;
    let word = "Ethereum";
    let secret = "mysecret";

    beforeEach(async () => {
        let SolveHash = await ethers.getContractFactory("SecuredFindThisHash");
        solveHash = await SolveHash.deploy({value: ethers.utils.parseEther("100")});

        [account1, account2] = await ethers.getSigners();
        console.log(account1.address);
        hash = await solveHash.hash();
    });

    describe("Solve hash with commit and reveal", () => {

        it("Commit and get guess works", async () => {
            let guesshash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes( account1.address.toLowerCase() + word + secret));
            console.log("hash", guesshash)
            expect(await solveHash.commitSolution(guesshash)).to.be.ok;

            await expect(solveHash.commitSolution(guesshash)).to.be.revertedWith("Already committed");

            let myguess = await solveHash.getMySolution();
            expect(myguess[0]).to.be.equal(guesshash);
            expect(myguess[2]).to.be.equal(false);
        });

        it("Reveal guess works", async () => {
            let previousBalance = await account1.getBalance();
            console.log("previousBalance - ", previousBalance);

            await expect(solveHash.revealSolution(word, secret)).to.be.revertedWith("Not committed yet");

            let guesshash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes( account1.address.toLowerCase() + word + secret));
            expect(await solveHash.commitSolution(guesshash)).to.be.ok;
            
            expect(await solveHash.revealSolution(word, secret)).to.be.ok;
            expect(await solveHash.ended()).to.be.equal(true);
            expect(await solveHash.winner()).to.be.equal(account1.address);

            let currentBalance = await account1.getBalance();
            console.log("currentBalance", currentBalance);
            let expectedBalance = previousBalance.add(ethers.utils.parseEther("100")).toString().slice(0,5);
            console.log("expectedBalance", expectedBalance);
            expect(currentBalance.toString().slice(0,5)).to.be.equal(expectedBalance);

            await expect(solveHash.revealSolution(word, secret)).to.be.revertedWith("Already ended");
        });


    });

});