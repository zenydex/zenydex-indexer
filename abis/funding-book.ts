export const FUNDING_BOOK_ABI = [
  { "type": "constructor", "inputs": [], "stateMutability": "nonpayable" },
  {
    "type": "function",
    "name": "BPS_DIVISOR",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
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
    "name": "SECONDS_PER_YEAR",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "accrue",
    "inputs": [{ "name": "_loanId", "type": "uint256", "internalType": "uint256" }],
    "outputs": [
      { "name": "interestAccrued", "type": "uint128", "internalType": "uint128" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "borrowerLoans",
    "inputs": [
      { "name": "", "type": "address", "internalType": "address" },
      { "name": "", "type": "address", "internalType": "address" },
      { "name": "", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "cancelOffer",
    "inputs": [{ "name": "_offerId", "type": "uint256", "internalType": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "claimableInterest",
    "inputs": [
      { "name": "", "type": "address", "internalType": "address" },
      { "name": "", "type": "address", "internalType": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "createOffer",
    "inputs": [
      {
        "name": "_offer",
        "type": "tuple",
        "internalType": "struct IFundingBook.Offer",
        "components": [
          { "name": "lender", "type": "address", "internalType": "address" },
          { "name": "asset", "type": "address", "internalType": "address" },
          { "name": "amount", "type": "uint128", "internalType": "uint128" },
          { "name": "ratePerYear", "type": "uint128", "internalType": "uint128" },
          { "name": "minDuration", "type": "uint32", "internalType": "uint32" },
          { "name": "maxDuration", "type": "uint32", "internalType": "uint32" },
          { "name": "autoRenew", "type": "bool", "internalType": "bool" }
        ]
      }
    ],
    "outputs": [{ "name": "id", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "getLoan",
    "inputs": [{ "name": "_loanId", "type": "uint256", "internalType": "uint256" }],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct IFundingBook.Loan",
        "components": [
          { "name": "lender", "type": "address", "internalType": "address" },
          { "name": "borrower", "type": "address", "internalType": "address" },
          { "name": "asset", "type": "address", "internalType": "address" },
          { "name": "principal", "type": "uint128", "internalType": "uint128" },
          { "name": "ratePerYear", "type": "uint128", "internalType": "uint128" },
          { "name": "startTs", "type": "uint32", "internalType": "uint32" },
          { "name": "endTs", "type": "uint32", "internalType": "uint32" },
          { "name": "lastAccrualTs", "type": "uint32", "internalType": "uint32" },
          { "name": "unpaidInterest", "type": "uint128", "internalType": "uint128" },
          { "name": "autoRenew", "type": "bool", "internalType": "bool" },
          { "name": "minDuration", "type": "uint32", "internalType": "uint32" },
          { "name": "maxDuration", "type": "uint32", "internalType": "uint32" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTotalDebt",
    "inputs": [
      { "name": "_borrower", "type": "address", "internalType": "address" },
      { "name": "_asset", "type": "address", "internalType": "address" }
    ],
    "outputs": [{ "name": "total", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "loans",
    "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "outputs": [
      { "name": "lender", "type": "address", "internalType": "address" },
      { "name": "borrower", "type": "address", "internalType": "address" },
      { "name": "asset", "type": "address", "internalType": "address" },
      { "name": "principal", "type": "uint128", "internalType": "uint128" },
      { "name": "ratePerYear", "type": "uint128", "internalType": "uint128" },
      { "name": "startTs", "type": "uint32", "internalType": "uint32" },
      { "name": "endTs", "type": "uint32", "internalType": "uint32" },
      { "name": "lastAccrualTs", "type": "uint32", "internalType": "uint32" },
      { "name": "unpaidInterest", "type": "uint128", "internalType": "uint128" },
      { "name": "autoRenew", "type": "bool", "internalType": "bool" },
      { "name": "minDuration", "type": "uint32", "internalType": "uint32" },
      { "name": "maxDuration", "type": "uint32", "internalType": "uint32" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "offers",
    "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "outputs": [
      { "name": "lender", "type": "address", "internalType": "address" },
      { "name": "asset", "type": "address", "internalType": "address" },
      { "name": "amount", "type": "uint128", "internalType": "uint128" },
      { "name": "ratePerYear", "type": "uint128", "internalType": "uint128" },
      { "name": "minDuration", "type": "uint32", "internalType": "uint32" },
      { "name": "maxDuration", "type": "uint32", "internalType": "uint32" },
      { "name": "autoRenew", "type": "bool", "internalType": "bool" }
    ],
    "stateMutability": "view"
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
    "name": "protocolFeeBps",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
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
    "name": "repay",
    "inputs": [
      { "name": "_loanId", "type": "uint256", "internalType": "uint256" },
      { "name": "_amount", "type": "uint128", "internalType": "uint128" }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "setProtocolFee",
    "inputs": [{ "name": "_feeBps", "type": "uint256", "internalType": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "takeOffer",
    "inputs": [
      { "name": "_offerId", "type": "uint256", "internalType": "uint256" },
      { "name": "_amount", "type": "uint128", "internalType": "uint128" },
      { "name": "_duration", "type": "uint32", "internalType": "uint32" }
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
    "type": "event",
    "name": "FundingFilled",
    "inputs": [
      {
        "name": "offerId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "loanId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "filled",
        "type": "uint128",
        "indexed": false,
        "internalType": "uint128"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Liquidated",
    "inputs": [
      {
        "name": "loanId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "principalCovered",
        "type": "uint128",
        "indexed": false,
        "internalType": "uint128"
      },
      {
        "name": "interestCovered",
        "type": "uint128",
        "indexed": false,
        "internalType": "uint128"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OfferCanceled",
    "inputs": [
      { "name": "id", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OfferCreated",
    "inputs": [
      {
        "name": "id",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "offer",
        "type": "tuple",
        "indexed": false,
        "internalType": "struct IFundingBook.Offer",
        "components": [
          { "name": "lender", "type": "address", "internalType": "address" },
          { "name": "asset", "type": "address", "internalType": "address" },
          { "name": "amount", "type": "uint128", "internalType": "uint128" },
          { "name": "ratePerYear", "type": "uint128", "internalType": "uint128" },
          { "name": "minDuration", "type": "uint32", "internalType": "uint32" },
          { "name": "maxDuration", "type": "uint32", "internalType": "uint32" },
          { "name": "autoRenew", "type": "bool", "internalType": "bool" }
        ]
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
    "type": "event",
    "name": "Repaid",
    "inputs": [
      {
        "name": "loanId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "principalRepaid",
        "type": "uint128",
        "indexed": false,
        "internalType": "uint128"
      },
      {
        "name": "interestPaid",
        "type": "uint128",
        "indexed": false,
        "internalType": "uint128"
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
  { "type": "error", "name": "ReentrancyGuardReentrantCall", "inputs": [] },
  {
    "type": "error",
    "name": "SafeERC20FailedOperation",
    "inputs": [{ "name": "token", "type": "address", "internalType": "address" }]
  }
] as const;
