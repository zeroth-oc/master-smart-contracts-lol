const {expect} = require('chai');
const { ethers } = require('hardhat');
const { mine } = require("@nomicfoundation/hardhat-network-helpers");


describe("Excel Appartment NFT", () => {

    let excelApparment;
    let auction;
    let seller;
    let bidder1;
    let bidder2;
    let nftId;

    beforeEach(async () => {
        [seller, buyer, bidder1, bidder2] = await ethers.getSigners();

        const ExcelApparment = await ethers.getContractFactory('ExcelAppartment'); 
        excelApparment = await ExcelApparment.deploy();
        await excelApparment.safeMint(seller.address);
        nftId = 0;

        const Auction = await ethers.getContractFactory('Auction');
        auction = await Auction.deploy(excelApparment.address, nftId);
        await excelApparment.approve(auction.address, nftId);
    })

    it("NFT is deployed", () => {
        expect(excelApparment.address).to.not.equal(ethers.constants.AddressZero);
    })
    
    it("Seller has an NFT", async () => {
        expect(await excelApparment.ownerOf(nftId)).to.be.equal(seller.address);
    })


    describe("Real Estate Auction", () => {
        
        it("Contract is deployed", () => {
            expect(auction.address).to.not.equal(ethers.constants.AddressZero);
        })

        it("Only owner can start Auction", async () => {
            await expect(auction.connect(bidder1).startAuction(ethers.utils.parseEther("1"), 3600*24*7))
            .to.be.revertedWith('Permission Denied')

            await auction.startAuction(ethers.utils.parseEther("1"), 3600*24*7)
            expect(await auction.isAuctionLive()).to.be.equal(true);

            await expect(auction.startAuction(ethers.utils.parseEther("1"), 3600*24*7))
            .to.be.revertedWith('Auction is live')
        })

        describe("Start Auction", () => {
            beforeEach(async () => {
                await auction.startAuction(ethers.utils.parseEther("1"), 60*5);
            })

            it("Owner cannot participate in bidding", async () => {
                await expect(auction.bid({value: ethers.utils.parseEther("2")})).to.be.revertedWith("Permission Denied");
            })
    
            it("Current bid should be higher than the last bid", async () => {
                await expect(auction.connect(bidder1).bid({value: ethers.utils.parseEther("1")})).to.be.revertedWith("Bid more than the latest bid")
            })
    
            it("Get latest bid function works", async () => {
                expect(await auction.highestBid()).to.be.equal(ethers.utils.parseEther("1")
                );
            });
    
            describe("End Auction", () => {

                it("Only inactive auction can be ended", async() => {
                    await expect(auction.endAuction()).to.be.revertedWith("Auction not ended");
                });
    
                it("Only admin can end auction", async() => {
                    await mine(1000);
    
                    expect(await auction.endAuction()).to.be.ok;
                    await expect(auction.connect(bidder1).endAuction()).to.be.revertedWith("Permission Denied");
                });
        
                it("The owner gets the highest bid", async() =>{    
                    expect(await auction.connect(bidder1).bid({value: ethers.utils.parseEther("2")})).to.be.ok;
                    expect(await auction.connect(bidder1).bid({value: ethers.utils.parseEther("3")})).to.be.ok;
    
                    expect(await ethers.provider.getBalance(auction.address)).to.be.equal(ethers.utils.parseEther("5"))
                    await mine(1000);
                    let sellerPreviousBalance = await seller.getBalance();
                    await auction.endAuction();
                    
                    expect(await auction.highestBid()).to.be.equal(ethers.utils.parseEther("3"));
                    let sellerCurrentBalance = await seller.getBalance();
                    let expectedBalance = sellerPreviousBalance.add(ethers.utils.parseEther("3")).toString().slice(0,5);
                    
                    expect(sellerCurrentBalance.toString().slice(0,5)).to.be.equal(expectedBalance);
                });
        
                
                it("The highest bidder gets the nft transferred", async() => {
                    expect(await excelApparment.ownerOf(nftId)).to.be.equal(auction.address)
                    expect(await auction.connect(bidder1).bid({value: ethers.utils.parseEther("2")})).to.be.ok;

                    await mine(1000);
                    await auction.endAuction();
                    expect(await excelApparment.ownerOf(nftId)).to.be.equal(bidder1.address)
                });
            })

            describe("Withdraw funds", () => {
                it("Bidders can withdraw their amount", async () => {
                    expect(await auction.connect(bidder1).bid({value: ethers.utils.parseEther("2")})).to.be.ok;
                    expect(await auction.connect(bidder2).bid({value: ethers.utils.parseEther("3")})).to.be.ok;
                    expect(await auction.connect(bidder2).bid({value: ethers.utils.parseEther("4")})).to.be.ok;

                    expect(await ethers.provider.getBalance(auction.address)).to.be.equal(ethers.utils.parseEther("9"))
                    
                    let bidder1PreviousBalance = await bidder1.getBalance();
                    await auction.connect(bidder1).withdraw()
                    expect(await ethers.provider.getBalance(auction.address)).to.be.equal(ethers.utils.parseEther("7"))
                    let bidder1CurrentBalance = await bidder1.getBalance();
                    let bidder1ExpectedBalance = bidder1PreviousBalance.add(ethers.utils.parseEther("2")).toString().slice(0,5);
                    expect(bidder1CurrentBalance.toString().slice(0,5)).to.be.equal(bidder1ExpectedBalance);


                    let bidder2PreviousBalance = await bidder2.getBalance();
                    await auction.connect(bidder2).withdraw()
                    let bidder2CurrentBalance = await bidder2.getBalance();
                    let bidder2ExpectedBalance = bidder2PreviousBalance.add(ethers.utils.parseEther("3")).toString().slice(0,5);
                    expect(bidder2CurrentBalance.toString().slice(0,5)).to.be.equal(bidder2ExpectedBalance);

                    expect(await ethers.provider.getBalance(auction.address)).to.be.equal(ethers.utils.parseEther("4"))
                })
            })
        })

        

    })

})