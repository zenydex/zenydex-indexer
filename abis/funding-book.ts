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
    "name": "MAX_LOANS_PER_ASSET",
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
    "name": "UPGRADE_INTERFACE_VERSION",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "accrue",
    "inputs": [{ "name": "_loanId", "type": "uint256", "internalType": "uint256" }],
    "outputs": [{ "name": "interestAccrued", "type": "uint128", "internalType": "uint128" }],
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
    "name": "borrowingLogic",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
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
    "name": "claimInterest",
    "inputs": [{ "name": "_asset", "type": "address", "internalType": "address" }],
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
          { "name": "originalPrincipal", "type": "uint128", "internalType": "uint128" },
          { "name": "ratePerYear", "type": "uint128", "internalType": "uint128" },
          { "name": "minDuration", "type": "uint32", "internalType": "uint32" },
          { "name": "maxDuration", "type": "uint32", "internalType": "uint32" },
          { "name": "autoRenew", "type": "bool", "internalType": "bool" }
        ]
      }
    ],
    "outputs": [{ "name": "id", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "nonpayable"
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
          { "name": "maxDuration", "type": "uint32", "internalType": "uint32" },
          { "name": "offerId", "type": "uint128", "internalType": "uint128" }
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
    "name": "initialize",
    "inputs": [{ "name": "initialOwner", "type": "address", "internalType": "address" }],
    "outputs": [],
    "stateMutability": "nonpayable"
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
      { "name": "maxDuration", "type": "uint32", "internalType": "uint32" },
      { "name": "offerId", "type": "uint128", "internalType": "uint128" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "minDeposit",
    "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
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
      { "name": "originalPrincipal", "type": "uint128", "internalType": "uint128" },
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
    "name": "pause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "paused",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
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
    "name": "protocolFees",
    "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "proxiableUUID",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }],
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
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "rescueERC20",
    "inputs": [
      { "name": "token", "type": "address", "internalType": "address" },
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "amount", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "rescueETH",
    "inputs": [
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "amount", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setBorrowingLogic",
    "inputs": [{ "name": "_borrowingLogic", "type": "address", "internalType": "address" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setMinDeposit",
    "inputs": [
      { "name": "asset", "type": "address", "internalType": "address" },
      { "name": "amount", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
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
      { "name": "_duration", "type": "uint32", "internalType": "uint32" },
      { "name": "_borrower", "type": "address", "internalType": "address" }
    ],
    "outputs": [{ "name": "loanId", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [{ "name": "newOwner", "type": "address", "internalType": "address" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "unpause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "upgradeToAndCall",
    "inputs": [
      { "name": "newImplementation", "type": "address", "internalType": "address" },
      { "name": "data", "type": "bytes", "internalType": "bytes" }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "withdrawProtocolFees",
    "inputs": [
      { "name": "_asset", "type": "address", "internalType": "address" },
      { "name": "_recipient", "type": "address", "internalType": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "BorrowingLogicSet",
    "inputs": [
      { "name": "borrowingLogic", "type": "address", "indexed": true, "internalType": "address" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ERC20Rescued",
    "inputs": [
      { "name": "token", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "to", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ETHRescued",
    "inputs": [
      { "name": "to", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "FundingFilled",
    "inputs": [
      { "name": "offerId", "type": "uint256", "indexed": false, "internalType": "uint256" },
      { "name": "loanId", "type": "uint256", "indexed": false, "internalType": "uint256" },
      { "name": "filled", "type": "uint128", "indexed": false, "internalType": "uint128" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Initialized",
    "inputs": [
      { "name": "version", "type": "uint64", "indexed": false, "internalType": "uint64" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "InterestClaimed",
    "inputs": [
      { "name": "lender", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "asset", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Liquidated",
    "inputs": [
      { "name": "loanId", "type": "uint256", "indexed": false, "internalType": "uint256" },
      { "name": "principalCovered", "type": "uint128", "indexed": false, "internalType": "uint128" },
      { "name": "interestCovered", "type": "uint128", "indexed": false, "internalType": "uint128" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MinDepositUpdated",
    "inputs": [
      { "name": "asset", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }
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
          { "name": "originalPrincipal", "type": "uint128", "internalType": "uint128" },
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
      { "name": "previousOwner", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "newOwner", "type": "address", "indexed": true, "internalType": "address" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Paused",
    "inputs": [
      { "name": "account", "type": "address", "indexed": false, "internalType": "address" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ProtocolFeesWithdrawn",
    "inputs": [
      { "name": "asset", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "recipient", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Repaid",
    "inputs": [
      { "name": "loanId", "type": "uint256", "indexed": false, "internalType": "uint256" },
      { "name": "principalRepaid", "type": "uint128", "indexed": false, "internalType": "uint128" },
      { "name": "interestPaid", "type": "uint128", "indexed": false, "internalType": "uint128" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Unpaused",
    "inputs": [
      { "name": "account", "type": "address", "indexed": false, "internalType": "address" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Upgraded",
    "inputs": [
      { "name": "implementation", "type": "address", "indexed": true, "internalType": "address" }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "AddressEmptyCode",
    "inputs": [{ "name": "target", "type": "address", "internalType": "address" }]
  },
  {
    "type": "error",
    "name": "BelowMinDeposit",
    "inputs": [
      { "name": "amount", "type": "uint256", "internalType": "uint256" },
      { "name": "min", "type": "uint256", "internalType": "uint256" }
    ]
  },
  { "type": "error", "name": "BorrowingLogicNotSet", "inputs": [] },
  {
    "type": "error",
    "name": "ERC1967InvalidImplementation",
    "inputs": [{ "name": "implementation", "type": "address", "internalType": "address" }]
  },
  { "type": "error", "name": "ERC1967NonPayable", "inputs": [] },
  { "type": "error", "name": "ETHTransferFailed", "inputs": [] },
  { "type": "error", "name": "EnforcedPause", "inputs": [] },
  { "type": "error", "name": "ExpectedPause", "inputs": [] },
  { "type": "error", "name": "FailedCall", "inputs": [] },
  { "type": "error", "name": "InvalidBorrowingLogic", "inputs": [] },
  { "type": "error", "name": "InvalidInitialization", "inputs": [] },
  { "type": "error", "name": "NotInitializing", "inputs": [] },
  { "type": "error", "name": "OnlyBorrowingLogic", "inputs": [] },
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
  },
  { "type": "error", "name": "TimestampOverflow", "inputs": [] },
  { "type": "error", "name": "UUPSUnauthorizedCallContext", "inputs": [] },
  {
    "type": "error",
    "name": "UUPSUnsupportedProxiableUUID",
    "inputs": [{ "name": "slot", "type": "bytes32", "internalType": "bytes32" }]
  }
] as const;
