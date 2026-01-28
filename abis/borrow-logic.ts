export const BORROW_LOGIC_ABI = [
  {
    "type": "constructor",
    "inputs": [
      { "name": "_collateral", "type": "address", "internalType": "address" },
      { "name": "_riskEngine", "type": "address", "internalType": "address" },
      { "name": "_fundingBook", "type": "address", "internalType": "address" },
      { "name": "_collateralToken", "type": "address", "internalType": "address" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "PRECISION",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "borrowToken",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "collateral",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "address", "internalType": "contract Collateral" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "collateralAmounts",
    "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "collateralToken",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "fundingBook",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "address", "internalType": "contract FundingBook" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getHealthFactor",
    "inputs": [{ "name": "borrower", "type": "address", "internalType": "address" }],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isLiquidatable",
    "inputs": [{ "name": "borrower", "type": "address", "internalType": "address" }],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "liquidate",
    "inputs": [
      { "name": "borrower", "type": "address", "internalType": "address" },
      { "name": "loanId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "riskEngine",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "address", "internalType": "contract RiskEngine" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "takeFundingOffer",
    "inputs": [
      { "name": "collateralAmount", "type": "uint256", "internalType": "uint256" },
      { "name": "offerId", "type": "uint256", "internalType": "uint256" },
      { "name": "amount", "type": "uint128", "internalType": "uint128" },
      { "name": "duration", "type": "uint32", "internalType": "uint32" }
    ],
    "outputs": [{ "name": "loanId", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [
      { "name": "newOwner", "type": "address", "internalType": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdrawCollateral",
    "inputs": [{ "name": "amount", "type": "uint256", "internalType": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "CollateralDeposited",
    "inputs": [
      {
        "name": "borrower",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "CollateralWithdrawn",
    "inputs": [
      {
        "name": "borrower",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "HealthFactorUpdated",
    "inputs": [
      {
        "name": "borrower",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "healthFactor",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Liquidated",
    "inputs": [
      {
        "name": "borrower",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "liquidator",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "collateralSeized",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "loanId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      {
        "name": "previousOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "OwnableInvalidOwner",
    "inputs": [{ "name": "owner", "type": "address", "internalType": "address" }]
  },
  {
    "type": "error",
    "name": "OwnableUnauthorizedAccount",
    "inputs": [{ "name": "account", "type": "address", "internalType": "address" }]
  },
  { "type": "error", "name": "ReentrancyGuardReentrantCall", "inputs": [] }
] as const;
