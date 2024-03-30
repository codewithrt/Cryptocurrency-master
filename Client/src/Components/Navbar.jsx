import React, { Component ,useContext} from 'react'
import { Context } from '../Context/Context'
// import { connect } from 'react-redux'
// import { accountSelector } from '../store/selectors'

const Navbar =()=> {
const {CurrentAccount,connectWallet} = useContext(Context);

console.log(CurrentAccount);

    return (
        <>
<nav className="navbar navbar-expand-lg bg-primary navbar-dark">
  <div className="container-fluid">
    <a className="navbar-brand" href="#">DApp Token Exchange</a>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{justifyContent:'end'}}>
      <ul className="navbar-nav ml-auto mb-2 mb-lg-0">
        <li className="nav-item">
        {!CurrentAccount? <button className='button-41' onClick={connectWallet}>Connect to Wallet</button>: <a className="nav-link " href={`https://etherscan.io/address/${CurrentAccount}`}   target='_blank'>
            {CurrentAccount}
            </a>}
        </li>
      </ul>
      </div>
    </div>
  </nav>
</>

   )
  }
{/* // export default connect(mapStateToProps)(Navbar) */}
export default Navbar
{/* // function mapStateToProps(state) { */}
//   return {
//     account: accountSelector(state)
//   }
// }