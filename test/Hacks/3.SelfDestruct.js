const {expect} = require("chai");
const { ethers } = require('hardhat');

describe("Self Desctruct Attack", () => {

    let ticketBooking;
    let attacker;
    let account;

    beforeEach(async () =>{
        let TicketBooking = await ethers.getContractFactory("TicketBooking");
        ticketBooking = await TicketBooking.deploy();

        let Attack = await ethers.getContractFactory("Attack3");
        attacker = await Attack.deploy();

        account = await ethers.getSigner();
    })

    describe("Ticket Booking" , () => {
        it("Can buy tickets with 1 ether", async () => {
            expect(await ticketBooking.getBalance()).to.be.equal(0);
            expect(await ticketBooking.buyTicket({value : ethers.utils.parseEther("1")})).to.be.ok;
            expect(await ticketBooking.getBalance()).to.be.equal(ethers.utils.parseEther("1"));
            expect(await ticketBooking.havePurchased(account.address)).to.be.equal(true); 
        });

        it("Reverts when amount sent is more or less than 1 ether", async () => {
            await expect(ticketBooking.buyTicket({value : ethers.utils.parseEther("0.5")})).to.be.revertedWith("Need to pay 1 ether");
            await expect(ticketBooking.buyTicket({value : ethers.utils.parseEther("1.5")})).to.be.revertedWith("Need to pay 1 ether");
        })
    });

    describe("Attack", () => {
        it("Forcefully send ether with selfdesctruct", async () => {
            expect(await ticketBooking.getAvailableTickets()).to.be.equal(10);
            expect(await ticketBooking.buyTicket({value : ethers.utils.parseEther("1")})).to.be.ok;
            expect(await ticketBooking.getBalance()).to.be.equal(ethers.utils.parseEther("1"));
            expect(await ticketBooking.getAvailableTickets()).to.be.equal(9);

            expect(await attacker.attack(ticketBooking.address, {value: ethers.utils.parseEther("10")})).to.be.ok;
            expect(await ticketBooking.getBalance()).to.be.equal(ethers.utils.parseEther("11"));

            await expect(ticketBooking.buyTicket({value : ethers.utils.parseEther("1")})).to.be.revertedWith("Sorry. All tickets sold.");

            expect(await ticketBooking.getAvailableTickets()).to.be.equal(0);
        });
    })

})