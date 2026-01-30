import { ponder } from "ponder:registry";
import { Borrower, CollateralEvent, ProtocolMetrics } from "../ponder.schema";

const GLOBAL_ID = "GLOBAL";

async function ensureProtocolMetrics(context: any, timestamp: number) {
  const existing = await context.db.find(ProtocolMetrics, { id: GLOBAL_ID });
  if (!existing) {
    await context.db.insert(ProtocolMetrics).values({
      id: GLOBAL_ID,
      totalValueLocked: 0n,
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
  const { borrower, amount } = event.args;
  const timestamp = Number(event.block.timestamp);

  await context.db.upsert(Borrower, { id: borrower }).onConflictDoUpdate((prev) => ({
    collateralAmount: (prev.collateralAmount ?? 0n) + amount,
    lastUpdated: timestamp,
  })).onConflictDoInsert({
    collateralAmount: amount,
    totalDebt: 0n,
    healthFactor: 0n,
    lastUpdated: timestamp,
  });

  await context.db.insert(CollateralEvent).values({
    id: event.log.id,
    borrower,
    type: "DEPOSITED",
    amount,
    timestamp,
    txHash: event.transaction.hash,
  });

  // Update TVL in protocol metrics
  await ensureProtocolMetrics(context, timestamp);
  await context.db.update(ProtocolMetrics, { id: GLOBAL_ID }).set((prev) => ({
    totalValueLocked: (prev.totalValueLocked ?? 0n) + amount,
    lastUpdated: timestamp,
  }));
});

ponder.on("BorrowingLogic:CollateralWithdrawn", async ({ event, context }) => {
  const { borrower, amount } = event.args;
  const timestamp = Number(event.block.timestamp);

  await context.db.update(Borrower, { id: borrower }).set((prev) => ({
    collateralAmount: (prev.collateralAmount ?? 0n) - amount,
    lastUpdated: timestamp,
  }));

  await context.db.insert(CollateralEvent).values({
    id: event.log.id,
    borrower,
    type: "WITHDRAWN",
    amount,
    timestamp,
    txHash: event.transaction.hash,
  });

  // Update TVL in protocol metrics
  await context.db.update(ProtocolMetrics, { id: GLOBAL_ID }).set((prev) => ({
    totalValueLocked: (prev.totalValueLocked ?? 0n) - amount,
    lastUpdated: timestamp,
  }));
});

ponder.on("BorrowingLogic:HealthFactorUpdated", async ({ event, context }) => {
  const { borrower, healthFactor } = event.args;

  await context.db.upsert(Borrower, { id: borrower }).onConflictDoUpdate({
    healthFactor,
    lastUpdated: Number(event.block.timestamp),
  });
});

ponder.on("BorrowingLogic:Liquidated", async ({ event, context }) => {
  const { borrower, collateralSeized, loanId } = event.args;
  const timestamp = Number(event.block.timestamp);

  await context.db.update(Borrower, { id: borrower }).set((prev) => ({
    collateralAmount: (prev.collateralAmount ?? 0n) - collateralSeized,
    lastUpdated: timestamp,
  }));

  await context.db.insert(CollateralEvent).values({
    id: event.log.id,
    borrower,
    type: "SEIZED",
    amount: collateralSeized,
    timestamp,
    txHash: event.transaction.hash,
  });

  // Update TVL in protocol metrics (collateral is removed from protocol)
  await context.db.update(ProtocolMetrics, { id: GLOBAL_ID }).set((prev) => ({
    totalValueLocked: (prev.totalValueLocked ?? 0n) - collateralSeized,
    lastUpdated: timestamp,
  }));
});
