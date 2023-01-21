const {expect} = require("chai");
const { ethers } = require('hardhat');

describe("DelegateCall", () => {

    let proxy, implementation, atacker, account;
    
    beforeEach(async () =>{
      
        let Implementation = await ethers.getContractFactory("Implementation");
        implementation = await Implementation.deploy();
        console.log("Implementation - ", implementation.address);

        let Proxy = await ethers.getContractFactory("Proxy1");
        proxy = await Proxy.deploy(implementation.address);
        console.log("Proxy -", proxy.address);

        let Atacker = await ethers.getContractFactory("Attack4");
        atacker = await Atacker.deploy(proxy.address);  
        console.log("Attacker - ", atacker.address);

        account = await ethers.getSigner();
        console.log("Account - ", account.address);
    })

    describe("Attack", async () => {
        it("The admin of the proxy can be changed", async () => {
           expect(await proxy.owner()).to.be.equal(account.address);
           expect(await proxy.implementation()).to.be.equal(implementation.address);
          
           await atacker.attack();
           expect(await proxy.owner()).to.be.equal(atacker.address);
           expect(await proxy.implementation()).to.be.equal(atacker.address);

        });
    })

})