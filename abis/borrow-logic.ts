export const BORROW_LOGIC_ABI = [
  { "type": "constructor", "inputs": [], "stateMutability": "nonpayable" },
  { "type": "receive", "stateMutability": "payable" },
  {
    "type": "function",
    "name": "PRECISION",
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
    "name": "borrowToken",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "collateral",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address", "internalType": "contract Collateral" }],
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
    "name": "currentDayBorrows",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "dailyBorrowLimit",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "depositCollateral",
    "inputs": [{ "name": "amount", "type": "uint256", "internalType": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "fundingBook",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address", "internalType": "contract FundingBook" }],
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
    "name": "getRemainingDailyBorrowCapacity",
    "inputs": [],
    "outputs": [{ "name": "remaining", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "initialize",
    "inputs": [
      { "name": "_collateral", "type": "address", "internalType": "address" },
      { "name": "_riskEngine", "type": "address", "internalType": "address" },
      { "name": "_fundingBook", "type": "address", "internalType": "address" },
      { "name": "_collateralToken", "type": "address", "internalType": "address" },
      { "name": "initialOwner", "type": "address", "internalType": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
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
    "name": "lastBorrowResetTime",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
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
    "name": "liquidationPaused",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "maxSingleBorrow",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
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
    "name": "riskEngine",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address", "internalType": "contract RiskEngine" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "setCircuitBreakers",
    "inputs": [
      { "name": "_maxSingleBorrow", "type": "uint256", "internalType": "uint256" },
      { "name": "_dailyBorrowLimit", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setLiquidationPaused",
    "inputs": [{ "name": "_paused", "type": "bool", "internalType": "bool" }],
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
    "name": "withdrawCollateral",
    "inputs": [{ "name": "amount", "type": "uint256", "internalType": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "CircuitBreakerUpdated",
    "inputs": [
      { "name": "maxSingleBorrow", "type": "uint256", "indexed": false, "internalType": "uint256" },
      { "name": "dailyBorrowLimit", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "CollateralDeposited",
    "inputs": [
      { "name": "borrower", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "CollateralWithdrawn",
    "inputs": [
      { "name": "borrower", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }
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
    "name": "HealthFactorUpdated",
    "inputs": [
      { "name": "borrower", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "healthFactor", "type": "uint256", "indexed": false, "internalType": "uint256" }
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
    "name": "Liquidated",
    "inputs": [
      { "name": "borrower", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "liquidator", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "collateralSeized", "type": "uint256", "indexed": false, "internalType": "uint256" },
      { "name": "loanId", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "LiquidationPausedUpdated",
    "inputs": [
      { "name": "paused", "type": "bool", "indexed": false, "internalType": "bool" }
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
  { "type": "error", "name": "DebtOverflow", "inputs": [] },
  {
    "type": "error",
    "name": "ERC1967InvalidImplementation",
    "inputs": [{ "name": "implementation", "type": "address", "internalType": "address" }]
  },
  { "type": "error", "name": "ERC1967NonPayable", "inputs": [] },
  { "type": "error", "name": "ETHTransferFailed", "inputs": [] },
  { "type": "error", "name": "EnforcedPause", "inputs": [] },
  {
    "type": "error",
    "name": "ExceedsDailyBorrowLimit",
    "inputs": [
      { "name": "amount", "type": "uint256", "internalType": "uint256" },
      { "name": "remaining", "type": "uint256", "internalType": "uint256" }
    ]
  },
  {
    "type": "error",
    "name": "ExceedsMaxSingleBorrow",
    "inputs": [
      { "name": "amount", "type": "uint256", "internalType": "uint256" },
      { "name": "max", "type": "uint256", "internalType": "uint256" }
    ]
  },
  { "type": "error", "name": "ExpectedPause", "inputs": [] },
  { "type": "error", "name": "FailedCall", "inputs": [] },
  { "type": "error", "name": "InvalidInitialization", "inputs": [] },
  { "type": "error", "name": "LiquidationIsPaused", "inputs": [] },
  { "type": "error", "name": "NotInitializing", "inputs": [] },
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
  { "type": "error", "name": "UUPSUnauthorizedCallContext", "inputs": [] },
  {
    "type": "error",
    "name": "UUPSUnsupportedProxiableUUID",
    "inputs": [{ "name": "slot", "type": "bytes32", "internalType": "bytes32" }]
  }
] as const;
