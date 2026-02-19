import { ponder } from "ponder:registry";
import { Borrower, CollateralEvent, ProtocolMetrics } from "../ponder.schema";

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
      totalBorrowVolume: 0n,
      totalRepaidVolume: 0n,
      totalLiquidatedVolume: 0n,
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
  const { borrower: rawBorrower, amount } = event.args;
  const borrower = rawBorrower.toLowerCase() as `0x${string}`;
  const borrowerId = `${chainId}-${borrower}`;
  const timestamp = Number(event.block.timestamp);

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

  await context.db.insert(CollateralEvent).values({
    id: `${chainId}-${event.transaction.hash}-${event.log.logIndex}`,
    chainId,
    borrower,
    type: "DEPOSITED",
    amount,
    timestamp,
    txHash: event.transaction.hash,
  });

  // Update TVL in protocol metrics
  await ensureProtocolMetrics(context, chainId, timestamp);
  await context.db.update(ProtocolMetrics, { id: metricsId(chainId) }).set((prev) => ({
    totalWethLocked: (prev.totalWethLocked ?? 0n) + amount,
    lastUpdated: timestamp,
  }));
});

ponder.on("BorrowingLogic:CollateralWithdrawn", async ({ event, context }) => {
  const chainId = context.chain.id;
  const { borrower: rawBorrower, amount } = event.args;
  const borrower = rawBorrower.toLowerCase() as `0x${string}`;
  const borrowerId = `${chainId}-${borrower}`;
  const timestamp = Number(event.block.timestamp);

  await context.db.update(Borrower, { id: borrowerId }).set((prev) => ({
    collateralAmount: (prev.collateralAmount ?? 0n) - amount,
    lastUpdated: timestamp,
  }));

  await context.db.insert(CollateralEvent).values({
    id: `${chainId}-${event.transaction.hash}-${event.log.logIndex}`,
    chainId,
    borrower,
    type: "WITHDRAWN",
    amount,
    timestamp,
    txHash: event.transaction.hash,
  });

  // Update TVL in protocol metrics
  await context.db.update(ProtocolMetrics, { id: metricsId(chainId) }).set((prev) => ({
    totalWethLocked: (prev.totalWethLocked ?? 0n) - amount,
    lastUpdated: timestamp,
  }));
});

ponder.on("BorrowingLogic:HealthFactorUpdated", async ({ event, context }) => {
  const chainId = context.chain.id;
  const { borrower: rawBorrower, healthFactor } = event.args;
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
  const { borrower: rawBorrower, collateralSeized, loanId } = event.args;
  const borrower = rawBorrower.toLowerCase() as `0x${string}`;
  const borrowerId = `${chainId}-${borrower}`;
  const timestamp = Number(event.block.timestamp);

  await context.db.update(Borrower, { id: borrowerId }).set((prev) => ({
    collateralAmount: (prev.collateralAmount ?? 0n) - collateralSeized,
    lastUpdated: timestamp,
  }));

  await context.db.insert(CollateralEvent).values({
    id: `${chainId}-${event.transaction.hash}-${event.log.logIndex}`,
    chainId,
    borrower,
    type: "SEIZED",
    amount: collateralSeized,
    timestamp,
    txHash: event.transaction.hash,
  });

  // Update TVL in protocol metrics (collateral is removed from protocol)
  await context.db.update(ProtocolMetrics, { id: metricsId(chainId) }).set((prev) => ({
    totalWethLocked: (prev.totalWethLocked ?? 0n) - collateralSeized,
    lastUpdated: timestamp,
  }));
});
