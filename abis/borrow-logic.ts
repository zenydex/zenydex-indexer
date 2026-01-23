export const BORROW_LOGIC_ABI = [
    { type: "event", name: "CollateralDeposited", inputs: [{ name: "borrower", type: "address", indexed: true }, { name: "amount", type: "uint256", indexed: false }], anonymous: false },
    { type: "event", name: "CollateralWithdrawn", inputs: [{ name: "borrower", type: "address", indexed: true }, { name: "amount", type: "uint256", indexed: false }], anonymous: false },
    { type: "event", name: "HealthFactorUpdated", inputs: [{ name: "borrower", type: "address", indexed: true }, { name: "healthFactor", type: "uint256", indexed: false }], anonymous: false },
    { type: "event", name: "Liquidated", inputs: [{ name: "borrower", type: "address", indexed: true }, { name: "liquidator", type: "address", indexed: true }, { name: "collateralSeized", type: "uint256", indexed: false }, { name: "loanId", type: "uint256", indexed: false }], anonymous: false }
]