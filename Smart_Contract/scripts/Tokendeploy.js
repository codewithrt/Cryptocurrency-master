const hre = require("hardhat");
// const {ethers} = require("ethers")
const {ethers} = require("hardhat")
const web3 = require("web3")
// const Web3 = require("web3")
// const web3 = new Web3("https://goerli.infura.io/v3/7f2148d884c74dfb811443b3f1b50291")
// Utils
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000' // Ether token deposit address
const ether = (n) =>{
  return  web3.utils.toWei(n.toString(), 'ether')
}
const tokens = (n) => ether(n)

const wait = (seconds) => {
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}
// const wait = (seconds) => {
//   const milliseconds = seconds * 1000
//   return new Promise(resolve => setTimeout(resolve, milliseconds))
// }

async function main() {
   
  //  [Deployer,Receiver,User1,User2] = await hre.ethers.getSigners();
  // const accounts = await web3.eth.accounts;
  const accounts = await ethers.getSigners();
  // const accounts = await hre.ethers.getSigner();
   console.log(accounts[0].address);
  const Deployer = accounts[0];
  const Receiver = accounts[1];

  /// token deployment part
  const Token = await hre.ethers.getContractFactory("Token",Deployer);
  const  token = await Token.deploy();
  await token.deployed();
  console.log("Token contract deployed with address:", token.address);

  const feespercent = 1;
  const Exchange = await hre.ethers.getContractFactory("Exchange",Deployer);
  // console.log(Exchange);
  const exchange = await Exchange.deploy(token.address,feespercent);
  await exchange.deployed();
  console.log("Exchange contract deployed with address:", exchange.address);
  
  // Set the sender and receiver
  ////

 
  let amount = await web3.utils.toWei('10000','ether') //10000 tokensa
  console.log(amount);

  await token.transfer(Receiver.address ,amount,{from : Deployer.address})
  console.log(`${amount} tokens transferred from ${Deployer.address} to ${Receiver.address}`);

  const User1 = accounts[0];
  const User2 = accounts[1];
  // User1 deposit Ether
  const amount1 = 0.05;
  let guess =  await exchange.connect(User1).DepositEther({value:ether(amount1),from:User1.address})
  console.log(guess);
  let gess = await guess.wait();
  let ans = await gess.events.find(event => event.event === 'Deposits');
  console.log(ans);
  console.log("1 ether deposited by User1");
  // User 2 approves token
  const amount2 = 10000;
  let res= await token.connect(User2).approve(exchange.address,tokens(amount2),{from:User2.address});
  let mes = await res.wait();
  let evnt = await mes.events.find(event => event.event === 'Approval');
  console.log(tokens(amount2));
  console.log(`User2 approved 10000 tokens `);
  let resulr = await token.connect(User2).allowance(User2.address,exchange.address) ;
  console.log(exchange.address);
  console.log(resulr);

  // User 2 Deposits Token
  console.log(User2.address,token.address);
  // console.log(await token.connect(User2));
  // const adrs = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  // await token.connect(User2).transferFrom(User2.address,token.address,amount1)
  await exchange.connect(User2).depositToken(token.address,tokens(amount2),{gasLimit:210000})
  console.log('deposited 10000 token from user2');
 
  //   /////////////////////////////////////////////////////////////
  //   // Seed a Cancelled Order
  //   //
    // User 1 makes order to get tokens
    let result
    let orderId
    let rc
    let event
    result = await exchange.connect(User1).makeOrder(token.address, tokens(100), ETHER_ADDRESS, ether(0.0001))
    console.log(`Made order from ${User1.address}`)
    // const re = await contract.transfer(...args); // 100ms
     rc = await result.wait(); // 0ms, as tx is already confirmed
     event = rc.events.find(event => event.event === 'orders');
    console.log(event.args.id.toNumber());
    orderId = event.args.id.toNumber();
    // User 1 cancells order
    // orderId = result.logs[0].args.id
    await exchange.connect(User1).cancelOrder(orderId,{gasLimit:210000})
    console.log(`Cancelled order from ${User1.address}`)

    /////////////////////////////////////////////////////////////
    // Seed Filled Orders
    //

    // User 1 makes order
    result = await exchange.connect(User1).makeOrder(token.address, tokens(0.1), ETHER_ADDRESS, ether(0.00001),{from:User1.address})
    console.log(`Made order from ${User1.address}`)

    // User 2 fills order
    rc = await result.wait(); // 0ms, as tx is already confirmed
     event = rc.events.find(event => event.event === 'orders');
    console.log(event.args.id.toNumber());
    orderId = event.args.id.toNumber();
    console.log(orderId);
    console.log("error here");

    // tokens[tokenGet][msg.sender]
    // tokens[tokenGive][user]
    let firstcheck = await exchange._orders(orderId);
    let secondcheck = await exchange.tokens(ETHER_ADDRESS,User1.address)
    let thirdcheck = await exchange.tokens(token.address,User2.address)
    console.log(firstcheck);
    console.log(secondcheck);
    console.log(thirdcheck);

// filling order
console.log("order filling");
    let comst = await exchange.connect(User2).fillOrder(orderId,{from:User2.address,gasLimit:2100000})
    console.log(comst);
    await wait(5)
    console.log("done filling");
    let covt = await comst.wait();
    console.log(covt);
    let loadevent = covt.events.find(event => event.event === 'Trade')
    console.log(loadevent);
    let filled = await exchange.connect(User2).OrderFilled(orderId,{from:User2.address})
    console.log(filled);
    console.log(`Filled order from ${User2.address}`)

    // Wait 1 second
    await wait(1)

    // User 1 makes another order
    result = await exchange.connect(User1).makeOrder(token.address, tokens(50), ETHER_ADDRESS, ether(0.001),{from:User1.address})
    // // console.log(result);
    console.log(`Made order from ${User1.address}`)

    // User 2 fills another order
    rc = await result.wait(); // 0ms, as tx is already confirmed
     event = rc.events.find(event => event.event === 'orders');
    console.log(event.args.id.toNumber());
    orderId = event.args.id.toNumber();
    await exchange.connect(User2).fillOrder(orderId ,{from : User2.address,gasLimit:2100000})
    filled = await exchange.connect(User2).OrderFilled(orderId,{from:User2.address})
    console.log(filled);
    console.log(`Filled order from ${User2.address}`)

    // Wait 1 second
    await wait(1)

    // User 1 makes final order
    result = await exchange.connect(User1).makeOrder(token.address, tokens(200), ETHER_ADDRESS, ether(0.001))
    console.log(`Made order from ${User1.address}`)

    // User 2 fills final order
    rc = await result.wait(); // 0ms, as tx is already confirmed
     event = rc.events.find(event => event.event === 'orders');
    console.log(event.args.id.toNumber());
    orderId = event.args.id.toNumber();
    let remult = await exchange.connect(User2).fillOrder(orderId ,{from:User2.address,gasLimit:2100000})
    let dev = remult.wait();
    console.log(dev);
    filled = await exchange.connect(User2).OrderFilled(orderId,{from:User2.address})
    console.log(filled);
    console.log(`Filled order from ${User2.address}`)

    // Wait 1 second
    await wait(1)
    
    console.log("filled order show herer");
    let filleds1 = await exchange.filledOrders(1);
    console.log(filleds1);
    let filleds2 = await exchange.filledOrders(2);
    console.log(filleds2);
    let filleds3 = await exchange.filledOrders(3);
    console.log(filleds3);


    await wait(1)

    // User 1 makes order for checking filled
    result = await exchange.connect(User1).makeOrder(token.address, tokens(0.001), ETHER_ADDRESS, ether(0.0001),{from:User1.address})
    console.log(`Made order from ${User1.address}`)

    console.log("Over untill here for now");

    await wait(1)
    /////////////////////////////////////////////////////////////
    // Seed Open Orders
    //

    // User 1 makes 10 orders
    for (let i = 1; i <= 10; i++) {
      result = await exchange.connect(User1).makeOrder(token.address, tokens(10 * i), ETHER_ADDRESS, ether(0.001))
      console.log(`Made order from ${User1.address}`)
      // Wait 1 second
      await wait(1)
    }

    // // User 2 makes 10 orders
    for (let i = 1; i <= 10; i++) {
      result = await exchange.connect(User2).makeOrder(ETHER_ADDRESS, ether(0.001), token.address, tokens(10 * i))
      console.log(`Made order from ${User2.address}`)
      // Wait 1 second
      await wait(1)
    }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
