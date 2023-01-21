const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Uniswap V2", () => {

    let uniswap, uniswapFactory;
    let weth, usdc, dai;
    let account, account1, account2;
    let usdcAmount, linkAmount; 

    beforeEach( async () => {

        [account, account1, account2] = await ethers.getSigners();

        let Uniswap = await ethers.getContractFactory("UniswapV2Integration");
        uniswap = await Uniswap.deploy();

        weth = await ethers.getContractAt("IWrappedEther" ,"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");

        usdc = await ethers.getContractAt("ERC20Token1", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
        
        link = await ethers.getContractAt("ERC20Token1", "0x514910771AF9Ca656af840dff83E8264EcF986CA");
        
        uniswapFactory = await ethers.getContractAt("IUniswapV2Factory", "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f");
    });


    it("WETH deposit works", async () => {
        const deposit = await weth.deposit({ value: ethers.utils.parseEther('10') })
        await deposit.wait()
    });

    it("uniswap single swap with exact no of tokens in works", async () => {
        console.log("Start swapping 10 WETH for USDC");
        await weth.approve(uniswap.address, ethers.utils.parseEther("10"))
        let txn = await uniswap.singleSwapExactAmountIn(ethers.utils.parseEther("10"), 1, {
            gasLimit: 1000000
        });
        await txn.wait();
        
        usdcAmount = await usdc.balanceOf(account.address);
        expect(usdcAmount).to.be.greaterThan(0);
        expect(await weth.balanceOf(account.address)).to.be.equal(0);
        console.log("WETH - ", await weth.balanceOf(account.address));
        console.log("USDC - ", await usdc.balanceOf(account.address));
    });
  
    it("uniswap muliple swap with exact no of tokens in works", async () => {
        console.log("Start swapping all USDC for LINK");
        await usdc.approve(uniswap.address, usdcAmount)
        let txn = await uniswap.multipleSwapExactAmountIn(usdcAmount, 1, {
            gasLimit: 1000000
        });
        await txn.wait();

        expect(await link.balanceOf(account.address)).to.be.greaterThan(0);
        expect(await usdc.balanceOf(account.address)).to.be.equal(0);

        console.log("WETH - ", await weth.balanceOf(account.address));
        console.log("USDC - ", await usdc.balanceOf(account.address));
        console.log("LINK - ", ethers.utils.formatEther(await link.balanceOf(account.address)));
    })

    it("uniswap single swap with exact no of tokens out works", async () => {
        console.log("Start swapping 1500 USDC for WETH");
        
        const deposit = await weth.deposit({ value: ethers.utils.parseEther('10') })
        await deposit.wait()
        await weth.approve(uniswap.address, ethers.utils.parseEther("10"))
        let txn = await uniswap.singleSwapExactAmountOut(1500 * (10**6) , ethers.utils.parseEther("10"), {
            gasLimit: 1000000
        });
        await txn.wait();
        
        usdcAmount = await usdc.balanceOf(account.address);
        expect(usdcAmount).to.be.greaterThan(0);
        expect(await weth.balanceOf(account.address)).to.be.greaterThan(0);
        console.log("WETH - ", await weth.balanceOf(account.address));
        console.log("USDC - ", await usdc.balanceOf(account.address));
    });

    it("uniswap muliple swap with exact no of tokens out works", async () => {
        console.log("Start swapping 10 LINK for USDC");
        await usdc.approve(uniswap.address, usdcAmount)
        let txn = await uniswap.multipleSwapExactAmountOut(10 ** 6, usdcAmount, {
            gasLimit: 1000000
        });
        await txn.wait();

        expect(await link.balanceOf(account.address)).to.be.greaterThan(0);
        expect(await usdc.balanceOf(account.address)).to.be.greaterThan(0);

        console.log("WETH - ", await weth.balanceOf(account.address));
        console.log("USDC - ", await usdc.balanceOf(account.address));
        console.log("LINK - ", ethers.utils.formatEther(await link.balanceOf(account.address)));
    })


    it("uniswap add and remove liqidity works", async () => {
        let deposit = await weth.deposit({ value: ethers.utils.parseEther('10') })
        await deposit.wait()
        await weth.approve(uniswap.address, ethers.utils.parseEther("2"))
        let txn = await uniswap.singleSwapExactAmountOut(1500 * (10**6) , ethers.utils.parseEther("2"), {
            gasLimit: 1000000
        });
        await txn.wait();
        console.log("Before adding Liquidity");
        console.log("WETH - ", ethers.utils.formatEther(await weth.balanceOf(uniswap.address)));
        console.log("USDC - ", (await usdc.balanceOf(uniswap.address)) / 10**6 );

        await weth.approve(uniswap.address, ethers.utils.parseEther("1"))
        await usdc.approve(uniswap.address, await usdc.balanceOf(account.address));

        txn = await uniswap.addLiquidity(
            "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            ethers.utils.parseEther('1'),
            1500 * (10**6),
            {gasLimit: 1000000}
            );
        
        await txn.wait();

        console.log("After adding Liquidity");
        console.log("WETH - ", ethers.utils.formatEther(await weth.balanceOf(uniswap.address)));
        console.log("USDC - ", (await usdc.balanceOf(uniswap.address)) / 10**6 );
        
        let pairAddress = await uniswapFactory.getPair("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
        let liquidityToken = await ethers.getContractAt("ERC20Token1", pairAddress); 
        console.log(pairAddress);
        expect((await liquidityToken.balanceOf(uniswap.address)) / 10**18).to.be.greaterThan(0);
        console.log("Shares", await liquidityToken.balanceOf(uniswap.address));

        txn = await uniswap.removeLiquidity(
            "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            {gasLimit: 1000000}
            );
        
        await txn.wait();
        
        expect((await liquidityToken.balanceOf(uniswap.address))).to.be.equal(0);

        console.log("After removing Liquidity");
        console.log("WETH - ", ethers.utils.formatEther(await weth.balanceOf(uniswap.address)));
        console.log("USDC - ", (await usdc.balanceOf(uniswap.address)) / 10**6 );
    });

    it("Flash swap works", async () => {
        const deposit = await weth.deposit({ value: ethers.utils.parseEther('40') })
        await deposit.wait()

        await weth.approve(uniswap.address, ethers.utils.parseEther("40"));
        console.log("Caller - ", account.address);
        console.log("Fee Approval - ", await weth.allowance(account.address, uniswap.address));
        await uniswap.flashSwap(ethers.utils.parseEther("10000"), {gasLimit: 1000000});
    });
});