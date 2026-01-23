import { ponder } from "@/generated";
import { Borrower, CollateralEvent } from "../ponder.schema";

ponder.on("BorrowingLogic:CollateralDeposited", async ({ event, context }) => {
  const { borrower, amount } = event.args;

  await context.db.upsert(Borrower, { id: borrower }).onConflictDoUpdate((prev) => ({
    collateralAmount: prev.collateralAmount + amount,
    lastUpdated: Number(event.block.timestamp),
  })).onConflictDoInsert({
    collateralAmount: amount,
    totalDebt: 0n,
    healthFactor: 0n,
    lastUpdated: Number(event.block.timestamp),
  });

  await context.db.insert(CollateralEvent).values({
    id: event.log.id,
    borrower,
    type: "DEPOSITED",
    amount,
    timestamp: Number(event.block.timestamp),
    txHash: event.transaction.hash,
  });
});

ponder.on("BorrowingLogic:CollateralWithdrawn", async ({ event, context }) => {
  const { borrower, amount } = event.args;

  await context.db.update(Borrower, { id: borrower }).set((prev) => ({
    collateralAmount: prev.collateralAmount - amount,
    lastUpdated: Number(event.block.timestamp),
  }));

  await context.db.insert(CollateralEvent).values({
    id: event.log.id,
    borrower,
    type: "WITHDRAWN",
    amount,
    timestamp: Number(event.block.timestamp),
    txHash: event.transaction.hash,
  });
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

  await context.db.update(Borrower, { id: borrower }).set((prev) => ({
    collateralAmount: prev.collateralAmount - collateralSeized,
    lastUpdated: Number(event.block.timestamp),
  }));

  await context.db.insert(CollateralEvent).values({
    id: event.log.id,
    borrower,
    type: "SEIZED",
    amount: collateralSeized,
    timestamp: Number(event.block.timestamp),
    txHash: event.transaction.hash,
  });
});
