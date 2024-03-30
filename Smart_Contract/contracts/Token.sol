// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.14;

import "../node_modules/openzeppelin-solidity/contracts/utils/math/SafeMath.sol";
contract Token{
    using SafeMath for uint256;

    string public name = "DApp Token";
    string public symbol = "DAPP";
    uint256 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from , address indexed to , uint256 value);
    event  Approval(address indexed owner,address indexed spender,uint256 value);
  
    // we can set the totatal supply tokens for our exchange app
    constructor() {
        totalSupply = 1000000*(10**decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    // Function to transfer funds directly without a third party app and send money directly
    // Here tokens are transfered from callers address to the sender address with the no of tokens
    // So it checkes if sender or caller has sufficient balance of tokens to send .
    function transfer(address _to,uint256 _value) public returns(bool){
        require(balanceOf[msg.sender] >= _value);
        _transfer(msg.sender, _to, _value);
        return true;
    }

    // genrealised to use it again and again to do token transfer
    function _transfer(address _from ,address _to , uint256 _value) internal{
        require(_to != address(0));
         balanceOf[_from] = balanceOf[_from].sub(_value);
        balanceOf[_to] = balanceOf[_to].add(_value);
        emit Transfer(msg.sender, _to, _value); 
    }
    // Approve tokens
    // If a third party is involved we need to use it to set allowance for a third party 
    // So that it can do transactions within that allowance or can transact tokens within this allowance
    // User can only set the allowance for his account 
    // So is the mapping 
    // Allowance function has first argument of caller which set the set of allowances for individual user
    // Secondly the second argument takes the third party address and sets allowance for this account 
    // So the thirdparty can send transactions within the limit of the allownce set by the user
     function approve(address _spender,uint256 _value) public returns (bool success){
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
     }
    // Transfer from
    // The Third party allowance is set now
    // It can do transactions for user within allowance set by user
    // This function is calles by the thirdparty app and it calls for a transaction for transfer of token from user to person want to send
    // now it checks if the user has allowed the allowance for it then the allowance value is deducted and the transfer is made on behalf of user
    function transferFrom(address _from , address _to ,uint256 _value) public returns(bool success){
        allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_value);
       _transfer(_from, _to, _value);
       return true;
    }


}