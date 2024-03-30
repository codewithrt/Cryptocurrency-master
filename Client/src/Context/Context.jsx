import { Children, createContext ,useState,useEffect} from "react";
import {
  TokenAbi,
  TokenAddress,
  ExchangeAbi,
  ExhangeAddress,
} from "../utils/Constants";
import {ethers, providers} from "ethers"
import moment from 'moment'
import {ETHER_ADDRESS,GREEN,RED,DECIMALS,ether,tokens} from "../Components/Helpers"
import { fill, result} from "lodash";
import  groupBy  from "lodash/groupBy";
import get from "lodash/get";
import maxBy from "lodash/maxBy";
import minBy from "lodash/minBy";



export const Context = createContext();
const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const tokenContract = new ethers.Contract(TokenAddress,TokenAbi, signer);
  const exchangeContract = new ethers.Contract(
    ExhangeAddress,
    ExchangeAbi,
    signer
  );
  console.log(provider, signer, tokenContract, exchangeContract);
  return { tokenContract, exchangeContract, signer, provider };
};
const TransactionProvider = (children) => {
    const [CurrentAccount, setCurrentAccount] = useState('')
    const [Orders, setOrders] = useState(null);
    const [OpenOrders, setOpenOrders] = useState(null);
    const [myfilledorders, setmyfilledorders] = useState(null)
    const [myopenorder, setmyopenorder] = useState(null)
    const [graphData, setgraphData] = useState(null)
    const [allamount, setallamount] = useState([]);
  
let currentadd;
 

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) {
        return alert("Please install metamask");
      }
      const accounts = await ethereum.request({ method: "eth_accounts" });
      console.log(accounts);
      if (accounts.length) {
        // console.log("i am in check");
        console.log(accounts[0]);
        setCurrentAccount(accounts[0]);
        // setmycurrentacc(accounts[0])
        currentadd = accounts[0];
        console.log(currentadd);
        getEthereumContract();
        sortedfilledorder();
       orderBookSelector();
       getMyfilled();
        myOpenOrdersSelector();
       getPricechartData();
       Balances();
      } else {
        console.log("no ethreum accounts");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const connectWallet = async () => {
    try {
      if (!ethereum) {
        return alert("Please install metamask");
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log(accounts);
      setCurrentAccount(accounts[0]);
      currentadd = accounts[0];
      console.log(currentadd);
      getEthereumContract();
      sortedfilledorder();
       orderBookSelector();
       getMyfilled();
       myOpenOrdersSelector();
       getPricechartData();
       Balances();
    } catch (error) {
      console.log(error);
      throw new Error("No Ethereum Object.");
    }
  };
  useEffect(() => {
      checkIfWalletIsConnected()
    // sortedfilledorder();
    // orderBookSelector();
    // getMyfilled();
    // myOpenOrdersSelector();
    // getPricechartData();
  }, [])

  // 
  // sort only the
  const filledorders = async()=>{
    const { exchangeContract } = getEthereumContract();
    let u = 1;
    let orders = [];
    // console.log("i am here");
  
    while (true) {
      let x = await exchangeContract.filledOrders(u);
      console.log(x);
      // let filled = await exchangeContract.OrderFilled(u);
      // console.log(filled);
      // console.log(x);
      
        if ( x[1] !== "0x0000000000000000000000000000000000000000") {
            let x = await exchangeContract.filledOrders(u)
              orders.push(x)
              u = u+1;
        }
      
      else break;

    }

    // let  orders = await exchangeContract._orders(0);
    // console.log("order log");
     console.log(orders);
     return(orders)
  }
  
 
  const sortedfilledorder = async()=>{
    let orderss = await filledorders();
    //  console.log(orderss[1].timestamp.toNumber());
    //  console.log(orderss);
      orderss.map((order)=>{
        // console.log("herefirst"),
      // Sort orders by date ascending for price comparison
      order = order.slice().sort((a,b) => a.timestamp - b.timestamp),
      // console.log(order);
      // Decorate the orders
      order = decorateFilledOrders(orderss),
      // console.log(order);
      // Sort orders by date descending for displays
      order = order.slice().sort((a,b) => b.timestamp - a.timestamp),
      setOrders(order)
      // console.log("in sortedfilledorder ")
  });
      // console.log(orderss);
      return orderss
     
  }

  const decorateFilledOrders = (orders) => {
    // console.log(orders);
    // console.log("indecorateortedfilledorder ")
    // Track previous order to compare history
    let previousOrder = orders[0]
    // console.log(previousOrder);
    return(
      orders.map((order) => {
        order = decorateOrder(order)
        order = decorateFilledOrder(order, previousOrder)
        previousOrder = order // Update the previous order once it's decorated
        // console.log(order);
        return order
      })
    )
  }
  
  const decorateOrder = (order) => {
    // console.log(order);
    let etherAmount
    let tokenAmount
    // console.log(order);
    // console.log("in decorateOrder");
    if(order.tokenGive === ETHER_ADDRESS) {
      etherAmount = order.amountGive
      tokenAmount = order.amountGet
      // console.log(etherAmount);
    } else {
      etherAmount = order.amountGet
      tokenAmount = order.amountGive
      // console.log(etherAmount);
    }
  
    // Calculate token price to 5 decimal places
    const precision = 100000
    let tokenPrice = (etherAmount / tokenAmount)
    tokenPrice = Math.round(tokenPrice * precision) / precision
    // console.log(order.timestamp);
    // console.log(moment.unix(order.timestamp).format('h:mm:ss a M/D'));
    return({
      ...order,
      etherAmount: ether(etherAmount),
      tokenAmount: tokens(tokenAmount),
      tokenPrice,
      formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ss a M/D')
    })
  }
  
  const decorateFilledOrder = (order, previousOrder) => {
    // console.log("in desortedfilledorder ")
    // console.log(tokenPriceClass(order.tokenPrice, order.id, previousOrder));
    return({
      ...order,
      tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)
    })
  }
  
  
  const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
    // console.log("tokenpriceclass");
    // Show green price if only one order exists
    if(previousOrder.id === orderId) {
      return GREEN
    }
  
    // Show green price if order price higher than previous order
    // Show red price if order price lower than previous order
    if(previousOrder.tokenPrice <= tokenPrice) {
      return GREEN // success
    } else {
      return RED // danger
    }
  }
  // 
  // 
   const sortedOpenOrder = async() =>{
    const { exchangeContract } = getEthereumContract();
    let u = 1;
    let orders = [];
    // console.log("i am here");
  
    while (true) {
      let x = await exchangeContract._orders(u);
      let filled = await exchangeContract.OrderFilled(u);
      let cancelled = await exchangeContract.OrderCancelled(u);
      // console.log(x);
        if ( x[1] !== "0x0000000000000000000000000000000000000000") {
            // console.log("in the while");
            // console.log(x[u]);
            if (!filled && !cancelled) {
            let x = await exchangeContract._orders(u)
              orders.push(x)}
              u = u+1;
          }
          else break;


    }
    // let  orders = await exchangeContract._orders(0);
    //  console.log(orders);
     return(orders)

   }

  // Create the order book
 const orderBookSelector = async()=>{
  let orderss = await sortedOpenOrder();
  // console.log(orderss);
    // Decorate orders
   orderss = await decorateOrderBookOrders(orderss)
    // console.log(orderss);
    // Group orders by "orderType"
   let orders = sortOrder(orderss)
  //  console.log(orders);
    // console.log(orders);
    return orderss
 }
 const sortOrder =(orders)=>{
    // console.log(orders);
    
    orders = groupBy(orders , "orderType")
    // console.log(orders);
    // Fetch buy orders
    const buyOrders = get(orders, 'buy', [])
    // console.log(buyOrders);
    // Sort buy orders by token price
    orders = {
      ...orders,
      buyOrders: buyOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
    }
    // Fetch sell orders
    const sellOrders = get(orders, 'sell', [])
    // Sort sell orders by token price
    orders = {
      ...orders,
      sellOrders: sellOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
    }
    setOpenOrders(orders)
    // console.log(orders);
    return orders
    
 }

const decorateOrderBookOrders = (order) => {
  return(
  order.map((orders)=>{
     orders = decorateOrder(orders)
    //  console.log(orders);
     orders = decorateOrderBookOrder(orders)
    //  console.log(orders);
   return (orders)
  
  })
  )
    
}

  const decorateOrderBookOrder = (order) => {
  const orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
  return({
    ...order,
    orderType,
    orderTypeClass: (orderType === 'buy' ? GREEN : RED),
    orderFillAction: orderType === 'buy' ? 'sell' : 'buy'
  })
  }
  ////////////////////////////////////////////////////////////////////////////////////////
  // MyTransactions
   
  const getMyFilledOrder = async()=>{
   const {exchangeContract} = getEthereumContract();
   let u = 1;
   let myfilledorders = [];
  //  console.log("i am here");
 
   while (true) {
    let filled = await exchangeContract.filledOrders(u)
    //  let filled = await exchangeContract.OrderFilled(u);
    //  let cancelled = await exchangeContract.OrderCancelled(u);
    //  console.log(filled);
       if ( filled[1] !== "0x0000000000000000000000000000000000000000") {
          //  console.log("in the while");
          //  console.log(filled);
          //  console.log(currentadd);
          if (filled.user.toLowerCase()  == currentadd|| filled.UserFilled.toLowerCase() == currentadd || filled.user.toLowerCase()  == CurrentAccount|| filled.UserFilled.toLowerCase() == CurrentAccount) {
            // console.log("I am in");
            myfilledorders.push(filled)
          }
          u = u+1;
         }
         else break;
   }
   // let  orders = await exchangeContract._orders(0);
    // console.log(myfilledorders);
    return(myfilledorders)
     

  }

  const getMyfilled = async() =>{
    let orders = await getMyFilledOrder();
    // console.log(orders);
    let order = await myFilledOrdersSelector(orders);
    // console.log(order);
    let result = myfilledorder(order)
    setmyfilledorders(result);
  //  console.log(result);
  }

 const myFilledOrdersSelector = async (orders)=>{

   
    return(
       
      orders.map((orders)=>{
       // Sort by date ascending
      //  orders = orders.slice().sort((a,b) => a.timestamp - b.timestamp)
      //  console.log(orders);
       // Decorate orders - add display attributes
       orders = decorateMyFilledOrders(orders)
      //  console.log(orders);
       return orders
    })
    )
    }

    const myfilledorder = (order) =>{
      // console.log(order);
      let orders = order.slice().sort((a,b) => a.timestamp - b.timestamp)
      return( orders
      )
    }
  


  const decorateMyFilledOrders = (order) => {
    // console.log(order);
   let  account = currentadd
        order = decorateOrder(order)
        order = decorateMyFilledOrder(order, account)
        // console.log(order);
        return(order)
  }
  
  const decorateMyFilledOrder = (order,account) => {
    // console.log(order);
    const myOrder = order.user.toLowerCase() === account
    // console.log(myOrder);
  
    let orderType
    if(myOrder) {
      orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
    } else {
      orderType = order.tokenGive === ETHER_ADDRESS ? 'sell' : 'buy'
    }
  
    return({
      ...order,
      orderType,
      orderTypeClass: (orderType === 'buy' ? GREEN : RED),
      orderSign: (orderType === 'buy' ? '+' : '-')
    })
  }
  
  const sortmyopenorder = async () =>{
    const {exchangeContract} = getEthereumContract();
    let u = 1;
   let myfilledopenorders = [];
  //  console.log("i am here");
   while (true) {
    let openfilled = await exchangeContract._orders(u)
     let filled = await exchangeContract.OrderFilled(u);
     let cancelled = await exchangeContract.OrderCancelled(u);
    //  console.log(openfilled);
    //  console.log(openfilled.user.toLowerCase());
      // console.log(currentadd);
      // console.log(CurrentAccount);
    //  console.log(openfilled.user.toLowerCase()  === CurrentAccount);
       if ( openfilled[1] !== "0x0000000000000000000000000000000000000000") {
          //  console.log("in the while");
          //  console.log(openfilled);
          //  console.log(currentadd);
          //  console.log();
          if ((openfilled.user.toLowerCase()  === CurrentAccount || openfilled.user.toLowerCase()  === currentadd ) && !filled && !cancelled) {
            // console.log("I am in");
            myfilledopenorders.push(openfilled)
          }
          u = u+1;
         }
         else break;
   }
   // let  orders = await exchangeContract._orders(0);
    // console.log(myfilledopenorders);
    return(myfilledopenorders)
     

  }

const myOpenOrdersSelector = async()=>{
  let  account = currentadd;

  let orders = await sortmyopenorder();
  // console.log(orders);
      // Filtered orders created by current account
      // Decorate orders - add display attributes
      orders = decorateMyOpenOrders(orders,account)
      // Sort orders by date descending
     orders =  myopensort(orders);
     setmyopenorder(orders);
      console.log(orders);
      return orders
  }
  const myopensort =(orders)=>{
    orders = orders.slice().sort((a,b) => b.timestamp - a.timestamp)
    return orders
  }
  
  const decorateMyOpenOrders = (orders, account) => {
    return(
      orders.map((order) => {
        order = decorateOrder(order)
        order = decorateMyOpenOrder(order, account)
        return(order)
      })
    )
  }
  
  const decorateMyOpenOrder = (order, account) => {
    let orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
  
    return({
      ...order,
      orderType,
      orderTypeClass: (orderType === 'buy' ? GREEN : RED)
    })
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Pricechart

   const getPricechartData = async() =>{
   let result = await priceChartSelector();
  console.log(result);
    setgraphData(result);
   }

  const priceChartSelector = async()=>{
    let orders = await filledorders();
  
      // Decorate orders - add display attributes
      orders = orders.map((o) => decorateOrder(o))
      // Sort orders by date ascending to compare history
      orders = orders.slice().sort((a,b) => a.timestamp - b.timestamp)
      // console.log(orders);
      // Get last 2 order for final price & price change
      let secondLastOrder, lastOrder
      [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length)
      // get last order price
      const lastPrice = get(lastOrder, 'tokenPrice', 0)
      // console.log(lastPrice);
      // get second last order price
      const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)
      // console.log(secondLastPrice);
  
      return({
        lastPrice,
        lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
        series: [{
          data: buildGraphData(orders)
        }]
      })
  }
  
  const buildGraphData = (orders) => {
    // Group the orders by hour for the graph
    orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf('hour').format())
    // console.log(orders);
    // Get each hour where data exists
    const hours = Object.keys(orders)
    // console.log(hours);
    // Build the graph series
    const graphData = hours.map((hour) => {
      // Fetch all the orders from current hour
      const group = orders[hour]
      // Calculate price values - open, high, low, close
      const open = group[0] // first order
      const high = maxBy(group, 'tokenPrice') // high price
      const low = minBy(group, 'tokenPrice') // low price
      const close = group[group.length - 1] // last order
      // console.log(open,high,low,close);

      return({
        x: new Date(hour),
        y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
      })
    })
   console.log(graphData);
 
    return graphData
  }
  ////// /////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //  cancel order function
  const cancelOrder = async(order)=>{
   const {exchangeContract} = getEthereumContract();
   let result =  await exchangeContract.cancelOrder(order.id)
   let reswait = await result.wait();
  //  console.log(await result.wait());
  //  console.log(reswait.confirmations ==1);
  if (reswait.confirmations ==1) {
    setmyopenorder(null);
    setOpenOrders(null);
    orderBookSelector();
    myOpenOrdersSelector();
  }
}
   //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //  fill order function
  const fillgivenorder = async(order)=>{
    let account = CurrentAccount;
     const {exchangeContract} = getEthereumContract();
     let result = await exchangeContract.fillOrder(order.id);
     let reswait = await result.wait();
  //  console.log(await result.wait());
    if (reswait.confirmations ==1) {
      setOpenOrders(null)
      setOrders(null)
      setmyfilledorders(null);
      setmyopenorder(null);
      setgraphData(null);
      // set all to null to show reloading effect the again loading
      sortedfilledorder();
    orderBookSelector();
    getMyfilled();
    myOpenOrdersSelector();
    getPricechartData();
    }
  }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Balanced and deposits
const Balances = async() =>{
  // let accounts = ethers.
  // console.log(accounts);
  const {provider,tokenContract,exchangeContract} = getEthereumContract();
//  we got our ether ba;ance of wallet
  console.log(CurrentAccount);
  console.log(currentadd);
  const balance = await provider.getBalance(CurrentAccount?CurrentAccount : currentadd);
  let  walletbalance = ethers.utils.formatEther(balance.toBigInt())
  console.log(walletbalance);
  // Token balance in wallet
   let tokenbalance = await tokenContract.balanceOf(CurrentAccount?CurrentAccount : currentadd);
   tokenbalance = ethers.utils.formatEther(tokenbalance.toString());
   console.log(tokenbalance.toString());
  //  console.log(ethers.utils.formatEther(tokenbalance.toBigInt()));
  //  ether balance in exchange
  let exchangeEtherBalance = await exchangeContract.balanceOf(ETHER_ADDRESS,CurrentAccount?CurrentAccount : currentadd);
  exchangeEtherBalance = ethers.utils.formatEther(exchangeEtherBalance.toString());
  console.log(tokenbalance.toString());
  // exchangeEtherBalance = ethers.utils.formatEther(exchangeEtherBalance.toBigInt());
  // console.log(ethers.utils.formatEther(exchangeEtherBalance.toBigInt()));
  // exchange token balance
  let exchangeTokenBalance = await exchangeContract.balanceOf(TokenAddress,CurrentAccount?CurrentAccount : currentadd);
  exchangeTokenBalance = ethers.utils.formatEther(exchangeTokenBalance.toString());
  // exchangeTokenBalance = ethers.utils.formatEther(exchangeTokenBalance.toBigInt());
  // console.log(ethers.utils.formatEther(exchangeTokenBalance.toBigInt()));
  setallamount([walletbalance,tokenbalance,exchangeEtherBalance,exchangeTokenBalance])
  console.log(allamount);
}
// ///////////////////////////////////////////////////////////////////
// on deposit 
// Ether deposit
const DepositEther = async(e) =>{
  e = ethers.utils.parseEther(e)
  console.log(e);
const {exchangeContract} = getEthereumContract();
let result =  await exchangeContract.DepositEther({value:e})
result = await result.wait();
console.log(result.confirmations);
if (result.confirmations == 1) {
  setallamount(null)
  Balances();
}
}
  // Token deposit 
  const DepositToken = async(e)=>{
    e = ethers.utils.parseEther(e)
    console.log(e);
    const {exchangeContract,tokenContract} = getEthereumContract();
    let remsult = await tokenContract.approve(ExhangeAddress,e)
    remsult = remsult.wait();
    let result = await exchangeContract.depositToken(TokenAddress,e,{gasLimit :210000})
    // let result = await exchangeContract.depositToken("0x242941182f6127947839E0445F02be1028De480E",1,{gasLimit :210000})
    console.log(result);
    result = await result.wait();
    console.log(result.confirmations);
    if (result.confirmations == 1) {
      setallamount(null)
      Balances();
  }
  }
  // ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const WithdrawEther = async(e) =>{
    e = ethers.utils.parseEther(e)
    console.log(e);
    const {exchangeContract} = getEthereumContract();
    let result = await exchangeContract.WithdrawEther(e);
    result = await result.wait();
    // console.log(result);
    // console.log(result.confirmations);
    if (result.confirmations == 1) {
      setallamount(null)
      Balances();
    }
  }
  const WithdrawToken = async(e)=>{
    e = ethers.utils.parseEther(e)
    console.log(e);
    const {exchangeContract} = getEthereumContract();
    let result = await exchangeContract.WithdrawToken(TokenAddress,e);
    result = await result.wait();
    if (result.confirmations == 1) {
      setallamount(null)
      Balances();
    }
  }
  // ///////////////////////////////////////////////////////////////////////////////////////////////
  // makeorder
  const MakeBuyOrder = async(amount,price)=>{
    const tokenGet = TokenAddress;
    const amountGet = ethers.utils.parseEther(amount);
    const tokenGive = ETHER_ADDRESS;
    const amountGive = (ethers.utils.parseEther((amount*price).toString()));
    const {exchangeContract} = getEthereumContract();
    let result = await exchangeContract.makeOrder(tokenGet,amountGet,tokenGive,amountGive);
    result = await result.wait();
    if (result.confirmations == 1) {
      setOpenOrders(null);
      setmyopenorder(null);
      orderBookSelector();
       myOpenOrdersSelector();
    }
  }
  // sellorder
  const MakeSellOrder = async(amount,price)=>{
    const tokenGet =  ETHER_ADDRESS;
    const amountGet = (ethers.utils.parseEther((amount*price).toString()));
    const tokenGive = TokenAddress;
    const amountGive = ethers.utils.parseEther(amount);
    const {exchangeContract} = getEthereumContract();
    let result = await exchangeContract.makeOrder(tokenGet,amountGet,tokenGive,amountGive);
    result = await result.wait();
    if (result.confirmations == 1) {
      setOpenOrders(null);
      setmyopenorder(null)
      orderBookSelector();
       myOpenOrdersSelector();
    }
  }

  return (
    <Context.Provider value={{CurrentAccount,connectWallet,Orders,OpenOrders,myfilledorders,myopenorder,graphData,cancelOrder,fillgivenorder,DepositEther,allamount,DepositToken,WithdrawEther,WithdrawToken,MakeBuyOrder,MakeSellOrder}}{...children}/>
  );
};
export { TransactionProvider };
