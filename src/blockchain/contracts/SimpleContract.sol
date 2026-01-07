// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract SimpleContract {
    uint public value;
    mapping(address => uint) balances;

    event Set(uint value);
    event Transfer(address from, address to, uint amount);

    function set(uint newValue) public {
        value = newValue;
        emit Set(newValue);
    }

    function get() public view returns (uint) {
        return (value);
    }

    error InsufficientBalance(uint requested, uint available);

    function transfer(address to, uint amount) public {
        require(
            amount <= balances[msg.sender],
            InsufficientBalance(amount, balances[msg.sender])
        );
        balances[msg.sender] -= amount;
        balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
    }
}
