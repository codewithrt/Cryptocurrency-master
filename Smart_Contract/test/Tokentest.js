const {ethers} = require("hardhat")
const web3 = require('web3')
const {expect} = require("chai")

const tokens = (n) =>{
     return  web3.utils.toWei(n.toString(), 'ether')
}

describe("Token",async()=>{
   const name  =  'DApp Token';
   const symbol = 'DApp';
   const decimals =  '18';
   const Supply =  1000000;
   const totalSupply = Supply.toString();
   let token ;
   const amount  = 100;

   beforeEach(async()=>{
    
    [deployer,receiver,exchange] = await ethers.getSigners();
    const Token  = await ethers.getContractFactory('Token',deployer);
    token = await Token.deploy();
    //  Transafer 
     result = await token.transfer(receiver.address , tokens(amount),{from : deployer.address})
   })
   describe('sending tokens',()=>{
    it('transfer token balances',async()=>{
        const deployerbal = await token.balanceOf(deployer.address);
        console.log('deployer balance',deployerbal);
        const receiverbal = await token.balanceOf(receiver.address);
        console.log('reciver balance ', receiverbal);
        const r = totalSupply-amount;
        expect(deployerbal).to.be.equal(tokens(r));
        expect(receiverbal).to.be.equal(tokens(amount))
    })
    it('emit a transfer event',async()=>{
        console.log(result);
    })

   })
   describe('failure',async()=>{
    it('rejects insufficient balances',async()=>{
       let invalidamount = tokens(10000000)
       try {
        await token.transfer(receiver.address,invalidamount,{from:deployer.address})
       } catch (error) {
        expect(error).to.be.exist
       }
    })
    it('rejects invalid receiptent', async()=>{
        let invalidamount = tokens(10000000)
        try {
            await token.transferFrom(deployer.address,receiver.address,invalidamount,{from : exchange.address})
        } catch (error) {
            expect(error).to.be.exist;
        }
    })
   })
   describe("Tokens on approving ",async()=>{
    beforeEach(async()=>{
        result = await token.approve(exchange.address,amount,{from:deployer.address})
    })

    describe("success",async()=>{
     it("allocates an allowance for delegated token spending on exchange",async()=>{
        const allowance = await token.allowance(deployer.address,exchange.address);
        expect(allowance.toString()).to.be.equal(amount.toString());
     })
    })
    describe("failure",()=>{
        it('rejects invalid spenders',async()=>{
            try {
                await token.approve(0x0,amount,{from:deployer.address})
            } catch (error) {
                expect(error).to.be.exist;
            }
            
        })
    })

   })

}) 