import { onchainTable } from "ponder";

export const Offer = onchainTable("Offer", (t) => ({
  id: t.text().primaryKey(), // "{chainId}-{offerId}"
  chainId: t.integer(),
  lender: t.hex(),
  asset: t.hex(),
  amount: t.bigint(),
  originalPrincipal: t.bigint(),
  ratePerYear: t.bigint(),
  minDuration: t.integer(),
  maxDuration: t.integer(),
  autoRenew: t.boolean(),
  status: t.text(), // "ACTIVE", "CANCELED", "FILLED"
  createdAt: t.integer(),
}));

export const Loan = onchainTable("Loan", (t) => ({
  id: t.text().primaryKey(), // "{chainId}-{loanId}"
  chainId: t.integer(),
  offerId: t.text(),
  lender: t.hex(),
  borrower: t.hex(),
  asset: t.hex(),
  principal: t.bigint(),
  ratePerYear: t.bigint(),
  startTs: t.integer(),
  endTs: t.integer(),
  lastAccrualTs: t.integer(),
  unpaidInterest: t.bigint(),
  autoRenew: t.boolean(),
  entryPrice: t.bigint(), // ETH price at borrow time (18 decimals)
  status: t.text(), // "ACTIVE", "REPAID", "LIQUIDATED"
  createdAt: t.integer(),
}));

export const Borrower = onchainTable("Borrower", (t) => ({
  id: t.text().primaryKey(), // "{chainId}-{address}"
  chainId: t.integer(),
  collateralAmount: t.bigint(),
  totalDebt: t.bigint(), // tracked across all active loans
  healthFactor: t.bigint(),
  lastUpdated: t.integer(),
}));

export const OfferEvent = onchainTable("OfferEvent", (t) => ({
  id: t.text().primaryKey(), // "{chainId}-{txHash}-{logIndex}"
  chainId: t.integer(),
  offerId: t.text(),
  type: t.text(), // "CREATED", "CANCELED"
  amount: t.bigint(),
  timestamp: t.integer(),
  txHash: t.hex(),
}));

export const LoanEvent = onchainTable("LoanEvent", (t) => ({
  id: t.text().primaryKey(), // "{chainId}-{txHash}-{logIndex}"
  chainId: t.integer(),
  loanId: t.text(),
  type: t.text(), // "FILLED", "REPAID", "LIQUIDATED"
  principal: t.bigint(),
  interest: t.bigint(),
  timestamp: t.integer(),
  txHash: t.hex(),
}));

export const CollateralEvent = onchainTable("CollateralEvent", (t) => ({
  id: t.text().primaryKey(), // "{chainId}-{txHash}-{logIndex}"
  chainId: t.integer(),
  borrower: t.hex(),
  type: t.text(), // "DEPOSITED", "WITHDRAWN", "SEIZED"
  amount: t.bigint(),
  timestamp: t.integer(),
  txHash: t.hex(),
}));

// Global protocol metrics for TVL, volume, active users, etc.
export const ProtocolMetrics = onchainTable("ProtocolMetrics", (t) => ({
  id: t.text().primaryKey(), // "GLOBAL-{chainId}"
  chainId: t.integer(),
  totalWethLocked: t.bigint(), // Total WETH collateral deposited
  totalUsdcLocked: t.bigint(), // Total USDC in active offers
  totalBorrowVolume: t.bigint(), // Cumulative borrowed amount
  totalRepaidVolume: t.bigint(), // Cumulative repaid amount
  totalLiquidatedVolume: t.bigint(), // Cumulative liquidated amount
  activeLoans: t.integer(), // Currently active loans
  totalLoans: t.integer(), // Total loans created
  activeBorrowers: t.integer(), // Borrowers with active loans
  totalBorrowers: t.integer(), // Total unique borrowers
  activeLenders: t.integer(), // Lenders with active offers
  totalLenders: t.integer(), // Total unique lenders
  activeOffers: t.integer(), // Currently active offers
  totalOffers: t.integer(), // Total offers created
  totalInterestPaid: t.bigint(), // Cumulative interest paid
  lastUpdated: t.integer(),
}));

// Leaderboard: duration-weighted points with PnL bonuses
export const UserPoints = onchainTable("UserPoints", (t) => ({
  id: t.text().primaryKey(), // "{chainId}-{address}"
  chainId: t.integer(),
  address: t.hex(),
  borrowVolume: t.bigint(), // cumulative USDC borrowed (6 decimals)
  lendVolume: t.bigint(), // cumulative USDC lent (6 decimals)
  totalLoans: t.integer(), // completed loans (repaid)
  totalOffers: t.integer(), // offers created
  points: t.bigint(), // total points (lending + borrowing + bonus)
  lendingPoints: t.bigint(), // points from lending activity
  borrowingPoints: t.bigint(), // points from borrowing activity
  bonusPoints: t.bigint(), // milestone bonus points
  totalDurationSecs: t.bigint(), // sum of loan durations in seconds
  bestPnlBps: t.integer(), // best PnL in basis points (e.g. 2300 = +23%)
  lastUpdated: t.integer(),
}));

// Track unique users (lenders and borrowers)
export const User = onchainTable("User", (t) => ({
  id: t.text().primaryKey(), // "{chainId}-{address}"
  chainId: t.integer(),
  isLender: t.boolean(),
  isBorrower: t.boolean(),
  activeLoansAsBorrower: t.integer(),
  activeOffersAsLender: t.integer(),
  firstSeenAt: t.integer(),
  lastActiveAt: t.integer(),
}));
