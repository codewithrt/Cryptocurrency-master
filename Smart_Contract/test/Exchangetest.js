const {ethers} = require("hardhat")
const web3 = require('web3')
const {expect} = require("chai")

const tokens = (n) =>{
     return  web3.utils.toWei(n.toString(), 'ether')
}

describe("Exchange",async()=>{
    const fees = 10;
    beforeEach(async()=>{
      [deployer,feesAccount,user1] = await ethers.getSigners();
      const Exchange = await ethers.getContractFactory('Exchange',deployer);
      exchange = await Exchange.deploy(feesAccount.address,fees);
      const Token = await ethers.getContractFactory('Token',deployer);
      token = await Token.deploy();
    })
    describe('deployment',()=>{
        it('tracks fees account',async()=>{
            const result = await exchange.feesAccount();
            // const result2 = await exchange.owner();
            // console.log(result2);
            // console.log(result);
            expect(result).to.be.equal(feesAccount.address);
        })
        it('tracks fees account',async()=>{
            const result = await exchange.feepercent();
            // const result2 = await exchange.owner();
            // console.log(result2);
            // console.log(result);
            expect(result).to.be.equal(fees );
        })
    })
    describe('depositing tokens',()=>{
        beforeEach(async()=>{
            // First approve for transferfrom function 
          await token.connect(user1).approve(exchange.address,tokens(10),{from :user1.address})
          result = await exchange.connect(user1).depositToken(token.address,tokens(10),{from :user1.address})
        
          
        })
        describe('success',async()=>{
           it('track the token deposit',async()=>{
            let balance = await token.balanceOf(exchange.address);
            console.log(balance);
            console.log(result);
           })
        })
        // it('tracks fees account',async()=>{
           
        // })
    })
   
})
