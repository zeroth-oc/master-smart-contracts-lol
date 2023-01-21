const {expect} = require('chai');
const { ethers } = require('hardhat');

describe("Vault", () => {

    let marketMaker, token1, token2;
    let account, account1, account2, account3; 

    beforeEach(async () => {
        [account, account1, account2, account3] = await ethers.getSigners();
        console.log(account1.address);

        const ERC20Token1 = await ethers.getContractFactory('ERC20Token1'); 
        token1 = await ERC20Token1.deploy();

        const ERC20Token2 = await ethers.getContractFactory('ERC20Token2'); 
        token2 = await ERC20Token2.deploy();

        const MarketMaker = await ethers.getContractFactory('ConstantProductAMM'); 
        marketMaker = await MarketMaker.deploy(token1.address, token2.address);
    })

    it("Initial Add liquidity works", async () => {
        expect(await marketMaker.totalSupply()).to.be.equal(0);

        expect(await token1.balanceOf(account1.address)).to.be.equal(0);
        expect(await token2.balanceOf(account1.address)).to.be.equal(0);
        await token1.mint(account1.address, 5000);
        await token2.mint(account1.address, 5000);
        expect(await token1.balanceOf(account1.address)).to.be.equal(5000);
        expect(await token2.balanceOf(account1.address)).to.be.equal(5000);

        await(token1.connect(account1).approve(marketMaker.address, 5000));
        await(token2.connect(account1).approve(marketMaker.address, 5000));
        
        await marketMaker.connect(account1).depositLiquidity(2000, 2000);
        expect(await token1.balanceOf(account1.address)).to.be.equal(3000);
        expect(await token2.balanceOf(account1.address)).to.be.equal(3000);
        console.log(await marketMaker.balanceOf(account1.address));
        expect(await marketMaker.balanceOf(account1.address)).to.be.equal(2000);
        expect(await marketMaker.totalSupply()).to.be.equal(2000);
        expect(await marketMaker.reserve1()).to.be.equal(2000);
        expect(await marketMaker.reserve2()).to.be.equal(2000);


        await expect(marketMaker.connect(account1).depositLiquidity(2000, 1000)).to.be.revertedWith("x/y != dy/dx");
    });

    it("Swap works", async () => {
        await token1.mint(account1.address, 5000);
        await token2.mint(account1.address, 5000);
        await(token1.connect(account1).approve(marketMaker.address, 5000));
        await(token2.connect(account1).approve(marketMaker.address, 5000));
        await marketMaker.connect(account1).depositLiquidity(2000, 2000);
        
        // Exchaning Token 1 for Token 2
        await token1.mint(account2.address, 500);
        expect(await token1.balanceOf(account2.address)).to.be.equal(500);
        expect(await token2.balanceOf(account2.address)).to.be.equal(0);
        await(token1.connect(account2).approve(marketMaker.address, 500));
        await marketMaker.connect(account2).swap(token1.address, 500);
        let amount = await token2.balanceOf(account2.address);
        console.log("Amount of token 2 received", amount)
        expect(await marketMaker.reserve1()).to.be.equal(2500);
        expect(await marketMaker.reserve2()).to.be.equal(2000 - amount);

        // Exchaning Token 2 for Token 1
        await token2.mint(account3.address, 200);
        expect(await token2.balanceOf(account3.address)).to.be.equal(200);
        expect(await token1.balanceOf(account3.address)).to.be.equal(0);
        await(token2.connect(account3).approve(marketMaker.address, 200));
        await marketMaker.connect(account3).swap(token2.address, 200);
        amount = await token1.balanceOf(account3.address);
        console.log("Amount of token 1 received", amount)
        expect(await marketMaker.reserve2()).to.be.equal(2000 - 398 + 200);
        expect(await marketMaker.reserve1()).to.be.equal(2500 - amount);
    });

    it("Add liquidity works after many swaps", async () => {
        await token1.mint(account1.address, 5000);
        await token2.mint(account1.address, 5000);
        await(token1.connect(account1).approve(marketMaker.address, 5000));
        await(token2.connect(account1).approve(marketMaker.address, 5000));
        await marketMaker.connect(account1).depositLiquidity(2000, 2000);
        
        // Exchaning Token 1 for Token 2
        await token1.mint(account2.address, 500);
        expect(await token1.balanceOf(account2.address)).to.be.equal(500);
        expect(await token2.balanceOf(account2.address)).to.be.equal(0);
        await(token1.connect(account2).approve(marketMaker.address, 500));
        await marketMaker.connect(account2).swap(token1.address, 500);
        let amount = await token2.balanceOf(account2.address);
        console.log("Amount of token 2 received", amount)
        expect(await marketMaker.reserve1()).to.be.equal(2500);
        expect(await marketMaker.reserve2()).to.be.equal(2000 - amount);

        // Exchaning Token 2 for Token 1
        await token2.mint(account3.address, 200);
        expect(await token2.balanceOf(account3.address)).to.be.equal(200);
        expect(await token1.balanceOf(account3.address)).to.be.equal(0);
        await(token2.connect(account3).approve(marketMaker.address, 200));
        await marketMaker.connect(account3).swap(token2.address, 200);
        amount = await token1.balanceOf(account3.address);
        console.log("Amount of token 1 received", amount)
        expect(await marketMaker.reserve2()).to.be.equal(2000 - 398 + 200);
        expect(await marketMaker.reserve1()).to.be.equal(2500 - amount);

        let reserve1 = parseInt(await marketMaker.reserve1());
        let reserve2 = parseInt(await marketMaker.reserve2());
        console.log("Reserve 1", reserve1);
        console.log("Reserve 2", reserve2);

        await expect(marketMaker.connect(account1).depositLiquidity(2000, 1000)).to.be.revertedWith("x/y != dy/dx");
        
        await marketMaker.connect(account1).depositLiquidity(reserve1 * 0.5, reserve2 * 0.5);

        expect(await marketMaker.reserve1()).to.be.equal(reserve1 + (reserve1 * 0.5));
        expect(await marketMaker.reserve2()).to.be.equal(reserve2 + (reserve2 * 0.5));
    });

    it("withdraw works", async () => {

        await token1.mint(account1.address, 2000);
        await token2.mint(account1.address, 2000);
        await(token1.connect(account1).approve(marketMaker.address, 2000));
        await(token2.connect(account1).approve(marketMaker.address, 2000));
        await marketMaker.connect(account1).depositLiquidity(2000, 2000);

        await token1.mint(account.address, 2000);
        await token2.mint(account.address, 2000);
        await(token1.connect(account).approve(marketMaker.address, 2000));
        await(token2.connect(account).approve(marketMaker.address, 2000));
        await marketMaker.connect(account).depositLiquidity(2000, 2000);

        // Exchaning Token 1 for Token 2
        await token1.mint(account2.address, 500);
        expect(await token1.balanceOf(account2.address)).to.be.equal(500);
        expect(await token2.balanceOf(account2.address)).to.be.equal(0);
        await(token1.connect(account2).approve(marketMaker.address, 500));
        await marketMaker.connect(account2).swap(token1.address, 500);
        let amount1 = parseInt(await token2.balanceOf(account2.address));
        console.log("Amount of token 2 received", amount1);
        expect(await marketMaker.reserve1()).to.be.equal(4500);
        expect(await marketMaker.reserve2()).to.be.equal(4000 - amount1);

        // Exchaning Token 2 for Token 1
        await token2.mint(account3.address, 200);
        expect(await token2.balanceOf(account3.address)).to.be.equal(200);
        expect(await token1.balanceOf(account3.address)).to.be.equal(0);
        await(token2.connect(account3).approve(marketMaker.address, 200));
        await marketMaker.connect(account3).swap(token2.address, 200);
        let amount2 = parseInt(await token1.balanceOf(account3.address));
        console.log("Amount of token 1 received", amount2)
        expect(await marketMaker.reserve2()).to.be.equal(4000 - amount1 + 200);
        expect(await marketMaker.reserve1()).to.be.equal(4500 - amount2);

        let reserve1 = parseInt(await marketMaker.reserve1());
        let reserve2 = parseInt(await marketMaker.reserve2());
        console.log("Reserve 1", reserve1);
        console.log("Reserve 2", reserve2);

        expect(await token1.balanceOf(account1.address)).to.be.equal(0);
        expect(await token2.balanceOf(account1.address)).to.be.equal(0);
        let shares = await marketMaker.balanceOf(account1.address);
        await marketMaker.connect(account1).withdrawLiquidity(shares);

        expect(await token1.balanceOf(account1.address)).to.be.equal(reserve1 * 0.5);
        expect(await token2.balanceOf(account1.address)).to.be.equal(reserve2 * 0.5);

        expect(await marketMaker.reserve1()).to.be.equal(reserve1 * 0.5);
        expect(await marketMaker.reserve2()).to.be.equal(reserve2 * 0.5);
    });
    
})