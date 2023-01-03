pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERCToken is ERC20 {
    constructor(
        string memory _name,
        string memory _decimals,
        uint _supply
    ) ERC20(_name, _decimals) {
        _mint(msg.sender, _supply * 10 ** decimals());
    }
}
