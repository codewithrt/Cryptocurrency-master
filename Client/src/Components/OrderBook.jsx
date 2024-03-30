import React, { Component ,useContext} from 'react'
import { connect } from 'react-redux'
import Spinner from './Spinner'
import { Context } from '../Context/Context'
import { OverlayTrigger } from 'react-bootstrap';
import {Tooltip} from 'react-bootstrap';

const renderOrder = (order,fillgivenorder) => {
  return(
    <OverlayTrigger
    key={order.id}
    placement='top'
    overlay={
      <Tooltip id={order.id}>
        {`Click here to ${order.orderFillAction}`}
      </Tooltip>
    }
  >
    <tr key={order.id} className="order-book-order" onClick={()=>fillgivenorder(order)}>
      <td>{order.tokenAmount}</td>
      <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
      <td>{order.etherAmount}</td>
    </tr>
    </OverlayTrigger>
  )
}

const showOrderBook = (orderBook,fillgivenorder) => {
//   const { orderBook } = props

  return(
    <tbody>
      {orderBook.sellOrders.map((order) => renderOrder(order,fillgivenorder))}
      <tr>
        <th>DAPP</th>
        <th>DAPP/ETH</th>
        <th>ETH</th>
      </tr>
      {orderBook.buyOrders.map((order) => renderOrder(order,fillgivenorder))}
    </tbody>
  )
}

const  OrderBook = () => {
   const {OpenOrders,fillgivenorder} = useContext(Context)

    return (
      <div className="vertical">
        <div className="card bg-dark text-white">
          <div className="card-header">
            Order Book
          </div>
          <div className="card-body order-book">
            <table className="table table-dark table-sm small">
              { OpenOrders ? showOrderBook(OpenOrders,fillgivenorder) : <Spinner type='table' /> }
            </table>
          </div>
        </div>
      </div>
    )
 }

// function mapStateToProps(state) {

//   return {
//     orderBook: orderBookSelector(state),
//     showOrderBook: orderBookLoadedSelector(state)
//   }
// }

// export default connect(mapStateToProps)(OrderBook);
export default OrderBook;
