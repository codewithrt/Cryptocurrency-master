import React, { Component,useState,useContext } from 'react'
import { connect } from 'react-redux'
import { Tabs, Tab } from 'react-bootstrap'
import Spinner from './Spinner'
import { Context } from '../Context/Context'

const showForm = (DepositEther,allamount,DepositToken,WithdrawEther,WithdrawToken) => {
 
  const [Etherdepositvalue, setEtherdepositvalue] = useState(0);
  const [Tokendepositvalue, setTokendepositvalue] = useState(0);
  const [EtherWithdrawvalue, setEtherWithdrawvalue] = useState(0);
  const [TokenWithdrawvalue, setTokenWithdrawvalue] = useState(0);
  
  const handleonchangedepositether = (e)=>{
    setEtherdepositvalue(e.target.value)
  }
  const handleonchangedeposittoken = (e)=>{
    setTokendepositvalue(e.target.value)
   }
   const handleonchangewithdrawether = (e)=>{
    setEtherWithdrawvalue(e.target.value)
   }
   const handleonchangewithdrawtoken = (e)=>{
    setTokenWithdrawvalue(e.target.value)
   }

  return(
    <Tabs defaultActiveKey="deposit" className="bg-dark text-white">

      <Tab eventKey="deposit" title="Deposit" className="bg-dark">
        <table className="table table-dark table-sm small">
          <thead>
            <tr>
              <th>Token</th>
              <th>Wallet</th>
              <th>Exchange</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ETH</td>
              <td>{allamount[0]}</td>
              <td>{allamount[2]}</td>
            </tr>
          </tbody>
        </table>

        <form className="row" onSubmit={(event) => {
          event.preventDefault()
          DepositEther(Etherdepositvalue);
        }}>
          <div className="col-12 col-sm pr-sm-2">
            <input
            type="text"
            placeholder="ETH Amount"
            onChange={(e)=>handleonchangedepositether(e) }
            className="form-control form-control-sm bg-dark text-white"
            required />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button type="submit" className="btn btn-primary btn-block btn-sm">Deposit</button>
          </div>
        </form>

        <table className="table table-dark table-sm small">
          <tbody>
            <tr>
              <td>DAPP</td>
              <td>{allamount[1]}</td>
              <td>{allamount[3]}</td>
            </tr>
          </tbody>
        </table>

        <form className="row" onSubmit={(event) => {
          event.preventDefault()
          DepositToken(Tokendepositvalue);
        }}>
          <div className="col-12 col-sm pr-sm-2">
            <input
            type="text"
            placeholder="DAPP Amount"
            onChange={(e) => handleonchangedeposittoken(e) }
            className="form-control form-control-sm bg-dark text-white"
            required />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button type="submit" className="btn btn-primary btn-block btn-sm">Deposit</button>
          </div>
        </form>

      </Tab>

      <Tab eventKey="withdraw" title="Withdraw" className="bg-dark">

        <table className="table table-dark table-sm small">
          <thead>
            <tr>
              <th>Token</th>
              <th>Wallet</th>
              <th>Exchange</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ETH</td>
              <td>{allamount[0]}</td>
              <td>{allamount[2]}</td>
            </tr>
          </tbody>
        </table>

        <form className="row" onSubmit={(event) => {
          event.preventDefault()
          WithdrawEther(EtherWithdrawvalue);
        }}>
          <div className="col-12 col-sm pr-sm-2">
            <input
            type="text"
            placeholder="ETH Amount"
            onChange={(e) => handleonchangewithdrawether(e) }
            className="form-control form-control-sm bg-dark text-white"
            required />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button type="submit" className="btn btn-primary btn-block btn-sm">Withdraw</button>
          </div>
        </form>

        <table className="table table-dark table-sm small">
          <tbody>
            <tr>
              <td>DAPP</td>
              <td>{allamount[1]}</td>
              <td>{allamount[3]}</td>
            </tr>
          </tbody>
        </table>

        <form className="row" onSubmit={(event) => {
          event.preventDefault()
          WithdrawToken(TokenWithdrawvalue);
        }}>
          <div className="col-12 col-sm pr-sm-2">
            <input
            type="text"
            placeholder="DAPP Amount"
            onChange={(e) => handleonchangewithdrawtoken(e) }
            className="form-control form-control-sm bg-dark text-white"
            required />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button type="submit" className="btn btn-primary btn-block btn-sm">Withdraw</button>
          </div>
        </form>

      </Tab>
    </Tabs>
  )
}

const Balance =()=> {
  const {DepositEther,allamount,DepositToken,WithdrawEther,WithdrawToken} = useContext(Context)
  console.log(allamount);

    return (
      <div className="card bg-dark text-white">
        <div className="card-header">
          Balance
        </div>
        <div className="card-body">
          { allamount ? showForm(DepositEther,allamount,DepositToken,WithdrawEther,WithdrawToken) : <Spinner />}
        </div>
      </div>
    )
}

// function mapStateToProps(state) {
//   const balancesLoading = balancesLoadingSelector(state)

//   return {
//     account: accountSelector(state),
//     exchange: exchangeSelector(state),
//     token: tokenSelector(state),
//     web3: web3Selector(state),
//     etherBalance: etherBalanceSelector(state),
//     tokenBalance: tokenBalanceSelector(state),
//     exchangeEtherBalance: exchangeEtherBalanceSelector(state),
//     exchangeTokenBalance: exchangeTokenBalanceSelector(state),
//     balancesLoading,
//     showForm: !balancesLoading,
//     etherDepositAmount: etherDepositAmountSelector(state),
//     etherWithdrawAmount: etherWithdrawAmountSelector(state),
//     tokenDepositAmount: tokenDepositAmountSelector(state),
//     tokenWithdrawAmount: tokenWithdrawAmountSelector(state),
//   }
// }

// export default connect(mapStateToProps)(Balance)
export default Balance;
