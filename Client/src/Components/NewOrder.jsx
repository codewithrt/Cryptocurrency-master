import React, { Component ,useContext,useState} from 'react'
import { connect } from 'react-redux'
import { Tabs, Tab } from 'react-bootstrap'
import Spinner from './Spinner'
import { Context } from '../Context/Context'


const showForm = (MakeBuyOrder,MakeSellOrder) => {
    const [buyAmount, setbuyAmount] = useState(0);
    const [buyPrice, setbuyPrice] = useState(0);
    const [sellAmount, setsellAmount] = useState(0);
    const [sellPrice, setsellPrice] = useState(0);

const handlebuyamountvalue = (e)=>{
    setbuyAmount(e.target.value)
}
const handlebuypricevalue = (e)=>{
    setbuyPrice(e.target.value)
}
const handlesellamountvalue = (e)=>{
    setsellAmount(e.target.value)
}
const handlesellpricevalue = (e)=>{
    setsellPrice(e.target.value)
}
  return(
    <Tabs defaultActiveKey="buy" className="bg-dark text-white">

      <Tab eventKey="buy" title="Buy" className="bg-dark">

          <form onSubmit={(event) => {
            event.preventDefault()
            MakeBuyOrder(buyAmount,buyPrice)
          }}>
          <div className="form-group small">
            <label>Buy Amount (DAPP)</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-sm bg-dark text-white"
                placeholder="Buy Amount"
                onChange={(e) => handlebuyamountvalue(e)}
                required
              />
            </div>
          </div>
          <div className="form-group small">
            <label>Buy Price</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-sm bg-dark text-white"
                placeholder="Buy Price"
                onChange={(e) => handlebuypricevalue(e)}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-sm btn-block">Buy Order</button>
          {/* { showBuyTotal ? <small>Total: {buyOrder.amount * buyOrder.price} ETH</small> : null } */}
          <div>
          <small>Total: {buyAmount * buyPrice} ETH</small> 
          </div>
        </form>

      </Tab>

      <Tab eventKey="sell" title="Sell" className="bg-dark">

        <form onSubmit={(event) => {
          event.preventDefault()
          MakeSellOrder(sellAmount,sellPrice)
        }}>
        <div className="form-group small">
          <label>Buy Sell (DAPP)</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control form-control-sm bg-dark text-white"
              placeholder="Sell amount"
              onChange={(e) => handlesellamountvalue(e)}
              required
            />
          </div>
        </div>
        <div className="form-group small">
          <label>Sell Price</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control form-control-sm bg-dark text-white"
              placeholder="Sell Price"
              onChange={(e) =>handlesellpricevalue(e)}
              required
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-sm btn-block">Sell Order</button>
        {/* { showSellTotal ? <small>Total: {sellOrder.amount * sellOrder.price} ETH</small> : null } */}
        <div>
         <small>Total: {sellAmount * sellPrice} ETH</small> 
         </div>
      </form>

      </Tab>
    </Tabs>
  )
}

const NewOrder = ()=> {
  const {MakeBuyOrder,MakeSellOrder} = useContext(Context)
    return (
      <div className="card bg-dark text-white">
        <div className="card-header">
          New Order
        </div>
        <div className="card-body">
          {showForm ? showForm(MakeBuyOrder,MakeSellOrder) : <Spinner />}
        </div>
      </div>
    )
}

export default NewOrder;