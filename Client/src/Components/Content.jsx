import React from 'react'
import Balance from './Balance'
import Trades from './Trades'
import OrderBook from './OrderBook'
import MyTransaction from './MyTransaction'
import PriceChart from './PriceChart'
import NewOrder from './NewOrder'
// import ApexChart from "./Chart"
const Content = () => {
  return (
    <div className="content">
    <div className="vertical-split">
      <Balance />
      <NewOrder />
    </div>
    <OrderBook />
    <div className="vertical-split">
      <PriceChart />
      <MyTransaction />
    </div>
    <Trades />
  </div>
  )
  }

export default Content