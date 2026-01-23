import { onchainTable } from "ponder";

export const Offer = onchainTable("Offer", (t) => ({
  id: t.text().primaryKey(),
  lender: t.hex(),
  asset: t.hex(),
  amount: t.bigint(),
  ratePerYear: t.bigint(),
  minDuration: t.integer(),
  maxDuration: t.integer(),
  autoRenew: t.boolean(),
  status: t.text(), // "ACTIVE", "CANCELED", "FILLED"
  createdAt: t.integer(),
}));

export const Loan = onchainTable("Loan", (t) => ({
  id: t.text().primaryKey(),
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
  status: t.text(), // "ACTIVE", "REPAID", "LIQUIDATED"
  createdAt: t.integer(),
}));

export const Borrower = onchainTable("Borrower", (t) => ({
  id: t.hex().primaryKey(), // borrower address
  collateralAmount: t.bigint(),
  totalDebt: t.bigint(), // tracked across all active loans
  healthFactor: t.bigint(),
  lastUpdated: t.integer(),
}));

export const OfferEvent = onchainTable("OfferEvent", (t) => ({
  id: t.text().primaryKey(),
  offerId: t.text(),
  type: t.text(), // "CREATED", "CANCELED"
  amount: t.bigint(),
  timestamp: t.integer(),
  txHash: t.hex(),
}));

export const LoanEvent = onchainTable("LoanEvent", (t) => ({
  id: t.text().primaryKey(),
  loanId: t.text(),
  type: t.text(), // "FILLED", "REPAID", "LIQUIDATED"
  principal: t.bigint(),
  interest: t.bigint(),
  timestamp: t.integer(),
  txHash: t.hex(),
}));

export const CollateralEvent = onchainTable("CollateralEvent", (t) => ({
  id: t.text().primaryKey(),
  borrower: t.hex(),
  type: t.text(), // "DEPOSITED", "WITHDRAWN", "SEIZED"
  amount: t.bigint(),
  timestamp: t.integer(),
  txHash: t.hex(),
}));
