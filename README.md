# ETH Protocol Fellowship Application Text

# Automated Market Makers (AMMs)

## Intro
I want to go for this topic as one of my portfolio projects (this repo contains the smart contract) involves building an Automated Market Maker (AMM) in web3, and I also have a background in finance.

## What is an AMM?
An Automated Market Maker (AMM) is a type of decentralized exchange (DEX) protocol that facilitates trading without the need for a traditional order book. Instead of matching buy and sell orders, an AMM uses liquidity pools and a mathematical formula to price assets. This innovation has become a cornerstone of decentralized finance (DeFi).

## How AMMs Work
## Liquidity Pools
AMMs are based on liquidity pools, which is a collections of tokens that are bound in smart contracts. Liquidity providers, usually pay equal !values of two tokens (e.g. ETH and USDT) into these pools. In return, they receive liquidity tokens equal to their stake and earn a portion of the trading fees.

## Pricing Mechanism
Prices in AMMs are determined by mathematical formulas. The most simple but also common is the constant product formula: x * y = k, where x and y are the quantities of the two tokens and k is a constant. This formula ensures that the product of the two token amounts remains constant,as a result adjusting prices based on supply and demand.

### Example
If a pool contains 10 ETH and 10,000 USDT, k would be 100,000. Swapping 1 ETH for USDT changes the pool to 11 ETH and approximately 9,090.91 USDT to maintain the constant product. This mechanism provides continuous liquidity and enables trades without a direct counterparty.

## Possible Improvements
Although the basic AMM model is effective, it has limitations such as impermanent loss and low capital efficiency. Protocols like Uniswap v3, with its concentrated liquidity, and Uniswap v4, with enhanced performance and added features, have worked out more sophisticated versions to address these issues.

## Smart Contract Implementation
A simple AMM implementation in Solidity can be found in this repositories, showcasing the integration of these principles into programmable code.
