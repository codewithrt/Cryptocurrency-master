// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.14;

import "./Token.sol";
import "../node_modules/openzeppelin-solidity/contracts/utils/math/SafeMath.sol";

 // Deposit & Withdraw Funds
    // Manage Orders - Make or Cancel
    // Handle Trades - Charge fees

    // TODO:
    // [X] Set fees account
    // [X] Deposit Ether
    // [X] Withdraw Ether
    // [X] Deposit tokens
    // [X] Withdraw tokens
    // [X] Check balances
    // [X] Make order
    // [X] Cancel order
    // [X] Fill order
    // [X] Charge fees

contract Exchange{
    using SafeMath for uint256;

    address public feesAccount;
    uint256 public feepercent;
    address public owner;
    uint256 public orderCount;
    uint256 public filledOrderCount;
    address constant ETHER = address(0); //store Ether in tokens mapping with blank address
    // This function is to track the total ether that is deposited by diffrent senders
    // This function also tracks of the total token of which type and which sender deposited
    mapping(address => mapping(address => uint256)) public tokens;
    mapping (uint256 => bool ) public OrderCancelled ; 
    mapping (uint256 => bool ) public OrderFilled ; 

    event Deposits(address token,address user,uint256 amount,uint256 balance);
    event Withdraw(address token,address user,uint256 amount,uint256 balance);
   event orders(
      uint id,
      address user,
      address tokenGet,
      uint amountGet,
      address tokenGive,
      uint amountGive,
      uint timestamp
   );
   event CanceledOrder(
       uint id,
      address user,
      address tokenGet,
      uint amountGet,
      address tokenGive,
      uint amountGive,
      uint timestamp
   );
   event Trade(
      uint id,address user,address tokenGet,uint amountGet,address tokenGive,uint amountGive
   );
   
   struct FilledOrders{
      uint id;
      address user;
      address tokenGet;
      uint amountGet;
      address tokenGive;
      uint amountGive;
      uint timestamp;
      address UserFilled;
   }

    struct Orders{
      uint id;
      address user;
      address tokenGet;
      uint amountGet;
      address tokenGive;
      uint amountGive;
      uint timestamp;
    }
   //  Way to store orders or to keep the track of orders
    mapping(uint256 => Orders) public _orders;
   //  track of filled ordes
   mapping(uint256 => FilledOrders) public filledOrders;


   constructor(address _feeaccount,uint256 _feepercent){
       feesAccount = _feeaccount;
       feepercent = _feepercent;
       owner = msg.sender;
   }


// tokens function Keeps a track of all the deposits and update the total value deposited by the sender
   function DepositEther() public payable {
     tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
     emit Deposits(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
   }

   function WithdrawEther(uint _amount) public {
    require(tokens[ETHER][msg.sender] >= _amount);
    tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
   payable (msg.sender).transfer(_amount);
    emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
   }

// Function keeps a track of the tokens that are deposited by the user
// it checks if the user is our blank account we are using for tracking ether transaction
// _token defines which token is to be used and is called using its address
// Token contract is callled with requires token type by address and then transferfrom is called from that contract 
// It transafers the tokens by calling Transferfrom function from msg.sender to the exchange smart contract 
// tokens mapping function updates the tokens for required type and the sender from which tokens are extracted
   function depositToken(address _token,uint _amount) public {
    require(_token != ETHER);
    require(Token(_token).transferFrom(msg.sender, address(this), _amount));
    tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount)  ;
    emit Deposits(_token,msg.sender,_amount,tokens[_token][msg.sender]);
    // Which token?
    // How much? 
    // Send tokens to this contract
    // Manage deposit - update balance
    // emit an event
   }

   function WithdrawToken(address _token,uint _amount) public{
        require(_token != ETHER);
        require(tokens[_token][msg.sender] >= _amount);
        tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
        require(Token(_token).transfer(msg.sender, _amount));
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
   }

   function balanceOf(address _token,address _user) public view returns (uint256){
    return tokens[_token][_user];
   }

  //  a way to model the order
  //  a way to store the order
  //  add the order to storage
   function makeOrder(address _tokenget,uint256 _amountget,address _tokengive,uint256 _amountgive) public {
            orderCount += 1;
            // kkeeping the track of orders
            _orders[orderCount] = Orders(orderCount,msg.sender, _tokenget,_amountget,_tokengive,_amountgive,block.timestamp);
            emit orders(orderCount, msg.sender, _tokenget, _amountget, _tokengive, _amountgive, block.timestamp);
   }
   
   function cancelOrder(uint256 _id) public{
     Orders storage _order = _orders[_id];
     require(address(_order.user) == msg.sender);
     require(_order.id == _id);  // order must exist
     OrderCancelled[_id] = true;
     emit CanceledOrder(_id, msg.sender, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, _order.timestamp);
     
   }
   function fillOrder(uint256 _id) public {
      require(_id > 0 && _id <= orderCount ,"Order does not exist");
      require(!OrderFilled[_id] , "Order is already filled");
      require(!OrderCancelled[_id] , "Order is cancelled");
      // fetch order
      // execute trade 
      // charge fees
      // emit trade event
      // mark orders as filled
      Orders storage _order = _orders[_id];
      _trade(_id,_order.user,_order.tokenGet,_order.amountGet,_order.tokenGive,_order.amountGive);
      OrderFilled[_id] = true;
   }
   function _trade( uint id,address user,address tokenGet,uint amountGet,address tokenGive,uint amountGive)internal{
      filledOrderCount = filledOrderCount.add(1);
        uint256 feeamount = amountGive.mul(feepercent).div(100);
      
        tokens[tokenGet][feesAccount] = tokens[tokenGet][feesAccount].add(feeamount);
        tokens[tokenGet][msg.sender] = tokens[tokenGet][msg.sender].sub(amountGet.add(feeamount));
        tokens[tokenGet][user] = tokens[tokenGet][user].add(amountGet);
        tokens[tokenGive][msg.sender] =  tokens[tokenGive][msg.sender].add(amountGive);
        tokens[tokenGive][user] = tokens[tokenGive][user].sub(amountGive);
        

        filledOrders[filledOrderCount] =  FilledOrders(id ,user , tokenGet,amountGet, tokenGive, amountGive, block.timestamp, msg.sender);

        emit Trade(id, user, tokenGet, amountGet, tokenGive, amountGive );
   }
}