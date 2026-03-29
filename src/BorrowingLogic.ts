import { ponder } from "ponder:registry";
import { Borrower, BorrowerCollateral, CollateralEvent, ProtocolMetrics } from "../ponder.schema";

function metricsId(chainId: number) {
  return `GLOBAL-${chainId}`;
}

async function ensureProtocolMetrics(context: any, chainId: number, timestamp: number) {
  const id = metricsId(chainId);
  const existing = await context.db.find(ProtocolMetrics, { id });
  if (!existing) {
    await context.db.insert(ProtocolMetrics).values({
      id,
      chainId,
      totalWethLocked: 0n,
      totalUsdcLocked: 0n,
      totalDepositVolume: 0n,
      totalWithdrawVolume: 0n,
      totalBorrowVolume: 0n,
      totalRepaidVolume: 0n,
      totalLiquidatedVolume: 0n,
      totalCollateralDeposited: 0n,
      totalCollateralWithdrawn: 0n,
      totalAgentCycleVolume: 0n,
      activeLoans: 0,
      totalLoans: 0,
      activeBorrowers: 0,
      totalBorrowers: 0,
      activeLenders: 0,
      totalLenders: 0,
      activeOffers: 0,
      totalOffers: 0,
      totalInterestPaid: 0n,
      lastUpdated: timestamp,
    });
  }
  return existing;
}

ponder.on("BorrowingLogic:CollateralDeposited", async ({ event, context }) => {
  const chainId = context.chain.id;
  const { borrower: rawBorrower, token: rawToken, amount } = event.args;
  const borrower = rawBorrower.toLowerCase() as `0x${string}`;
  const asset = rawToken.toLowerCase() as `0x${string}`;
  const borrowerId = `${chainId}-${borrower}`;
  const collateralId = `${chainId}-${borrower}-${asset}`;
  const timestamp = Number(event.block.timestamp);

  // Update legacy Borrower table (backward compat)
  await context.db.insert(Borrower).values({
    id: borrowerId,
    chainId,
    collateralAmount: amount,
    totalDebt: 0n,
    healthFactor: 0n,
    lastUpdated: timestamp,
  }).onConflictDoUpdate((prev) => ({
    collateralAmount: (prev.collateralAmount ?? 0n) + amount,
    lastUpdated: timestamp,
  }));

  // Update per-asset collateral tracking
  await context.db.insert(BorrowerCollateral).values({
    id: collateralId,
    chainId,
    borrower,
    asset,
    amount,
    lastUpdated: timestamp,
  }).onConflictDoUpdate((prev) => ({
    amount: (prev.amount ?? 0n) + amount,
    lastUpdated: timestamp,
  }));

  await context.db.insert(CollateralEvent).values({
    id: `${chainId}-${event.transaction.hash}-${event.log.logIndex}`,
    chainId,
    borrower,
    asset,
    type: "DEPOSITED",
    amount,
    timestamp,
    txHash: event.transaction.hash,
  });

  await ensureProtocolMetrics(context, chainId, timestamp);
  await context.db.update(ProtocolMetrics, { id: metricsId(chainId) }).set((prev) => ({
    totalWethLocked: (prev.totalWethLocked ?? 0n) + amount,
    totalCollateralDeposited: (prev.totalCollateralDeposited ?? 0n) + amount,
    lastUpdated: timestamp,
  }));
});

ponder.on("BorrowingLogic:CollateralWithdrawn", async ({ event, context }) => {
  const chainId = context.chain.id;
  const { borrower: rawBorrower, token: rawToken, amount } = event.args;
  const borrower = rawBorrower.toLowerCase() as `0x${string}`;
  const asset = rawToken.toLowerCase() as `0x${string}`;
  const borrowerId = `${chainId}-${borrower}`;
  const collateralId = `${chainId}-${borrower}-${asset}`;
  const timestamp = Number(event.block.timestamp);

  await context.db.update(Borrower, { id: borrowerId }).set((prev) => ({
    collateralAmount: (prev.collateralAmount ?? 0n) - amount,
    lastUpdated: timestamp,
  }));

  // Update per-asset collateral tracking
  await context.db.insert(BorrowerCollateral).values({
    id: collateralId,
    chainId,
    borrower,
    asset,
    amount: 0n,
    lastUpdated: timestamp,
  }).onConflictDoUpdate((prev) => ({
    amount: (prev.amount ?? 0n) > amount ? (prev.amount ?? 0n) - amount : 0n,
    lastUpdated: timestamp,
  }));

  await context.db.insert(CollateralEvent).values({
    id: `${chainId}-${event.transaction.hash}-${event.log.logIndex}`,
    chainId,
    borrower,
    asset,
    type: "WITHDRAWN",
    amount,
    timestamp,
    txHash: event.transaction.hash,
  });

  await context.db.update(ProtocolMetrics, { id: metricsId(chainId) }).set((prev) => ({
    totalWethLocked: (prev.totalWethLocked ?? 0n) - amount,
    totalCollateralWithdrawn: (prev.totalCollateralWithdrawn ?? 0n) + amount,
    lastUpdated: timestamp,
  }));
});

ponder.on("BorrowingLogic:HealthFactorUpdated", async ({ event, context }) => {
  const chainId = context.chain.id;
  const { borrower: rawBorrower, token: _rawToken, healthFactor } = event.args;
  const borrower = rawBorrower.toLowerCase() as `0x${string}`;
  const borrowerId = `${chainId}-${borrower}`;

  await context.db.insert(Borrower).values({
    id: borrowerId,
    chainId,
    collateralAmount: 0n,
    totalDebt: 0n,
    healthFactor,
    lastUpdated: Number(event.block.timestamp),
  }).onConflictDoUpdate({
    healthFactor,
    lastUpdated: Number(event.block.timestamp),
  });
});

ponder.on("BorrowingLogic:Liquidated", async ({ event, context }) => {
  const chainId = context.chain.id;
  const { borrower: rawBorrower, collateralTokenUsed: rawToken, collateralSeized, loanId } = event.args;
  const borrower = rawBorrower.toLowerCase() as `0x${string}`;
  const asset = rawToken.toLowerCase() as `0x${string}`;
  const borrowerId = `${chainId}-${borrower}`;
  const collateralId = `${chainId}-${borrower}-${asset}`;
  const timestamp = Number(event.block.timestamp);

  await context.db.update(Borrower, { id: borrowerId }).set((prev) => ({
    collateralAmount: (prev.collateralAmount ?? 0n) - collateralSeized,
    lastUpdated: timestamp,
  }));

  // Update per-asset collateral tracking
  await context.db.insert(BorrowerCollateral).values({
    id: collateralId,
    chainId,
    borrower,
    asset,
    amount: 0n,
    lastUpdated: timestamp,
  }).onConflictDoUpdate((prev) => ({
    amount: (prev.amount ?? 0n) > collateralSeized ? (prev.amount ?? 0n) - collateralSeized : 0n,
    lastUpdated: timestamp,
  }));

  await context.db.insert(CollateralEvent).values({
    id: `${chainId}-${event.transaction.hash}-${event.log.logIndex}`,
    chainId,
    borrower,
    asset,
    type: "SEIZED",
    amount: collateralSeized,
    timestamp,
    txHash: event.transaction.hash,
  });

  await context.db.update(ProtocolMetrics, { id: metricsId(chainId) }).set((prev) => ({
    totalWethLocked: (prev.totalWethLocked ?? 0n) - collateralSeized,
    lastUpdated: timestamp,
  }));
});
