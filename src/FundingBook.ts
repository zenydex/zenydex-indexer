import { ponder } from "@/generated";
import { Offer, Loan, Borrower, OfferEvent, LoanEvent } from "../ponder.schema";

ponder.on("FundingBook:OfferCreated", async ({ event, context }) => {
  const { id, offer } = event.args;
  
  await context.db.insert(Offer).values({
    id: id.toString(),
    lender: offer.lender,
    asset: offer.asset,
    amount: offer.amount,
    ratePerYear: offer.ratePerYear,
    minDuration: offer.minDuration,
    maxDuration: offer.maxDuration,
    autoRenew: offer.autoRenew,
    status: "ACTIVE",
    createdAt: Number(event.block.timestamp),
  });

  await context.db.insert(OfferEvent).values({
    id: event.log.id,
    offerId: id.toString(),
    type: "CREATED",
    amount: offer.amount,
    timestamp: Number(event.block.timestamp),
    txHash: event.transaction.hash,
  });
});

ponder.on("FundingBook:OfferCanceled", async ({ event, context }) => {
  const { id } = event.args;

  await context.db.update(Offer, { id: id.toString() }).set({
    status: "CANCELED",
  });

  await context.db.insert(OfferEvent).values({
    id: event.log.id,
    offerId: id.toString(),
    type: "CANCELED",
    timestamp: Number(event.block.timestamp),
    txHash: event.transaction.hash,
  });
});

ponder.on("FundingBook:FundingFilled", async ({ event, context }) => {
  const { offerId, loanId, filled } = event.args;

  const offer = await context.db.find(Offer, { id: offerId.toString() });
  if (offer) {
    const newAmount = offer.amount - filled;
    await context.db.update(Offer, { id: offerId.toString() }).set({
      amount: newAmount,
      status: newAmount === 0n ? "FILLED" : "ACTIVE",
    });
  }

  const loanData = await context.client.readContract({
    abi: context.contracts.FundingBook.abi,
    address: context.contracts.FundingBook.address,
    functionName: "loans",
    args: [loanId],
  });

  await context.db.insert(Loan).values({
    id: loanId.toString(),
    offerId: offerId.toString(),
    lender: loanData.lender,
    borrower: loanData.borrower,
    asset: loanData.asset,
    principal: loanData.principal,
    ratePerYear: loanData.ratePerYear,
    startTs: loanData.startTs,
    endTs: loanData.endTs,
    lastAccrualTs: loanData.lastAccrualTs,
    unpaidInterest: loanData.unpaidInterest,
    autoRenew: loanData.autoRenew,
    status: "ACTIVE",
    createdAt: Number(event.block.timestamp),
  });

  await context.db.upsert(Borrower, { id: loanData.borrower }).onConflictDoUpdate((prev) => ({
    totalDebt: prev.totalDebt + filled,
    lastUpdated: Number(event.block.timestamp),
  })).onConflictDoInsert({
    collateralAmount: 0n,
    totalDebt: filled,
    healthFactor: 0n,
    lastUpdated: Number(event.block.timestamp),
  });

  await context.db.insert(LoanEvent).values({
    id: event.log.id,
    loanId: loanId.toString(),
    type: "FILLED",
    principal: filled,
    timestamp: Number(event.block.timestamp),
    txHash: event.transaction.hash,
  });
});

ponder.on("FundingBook:Repaid", async ({ event, context }) => {
  const { loanId, principalRepaid, interestPaid } = event.args;

  const loanData = await context.client.readContract({
    abi: context.contracts.FundingBook.abi,
    address: context.contracts.FundingBook.address,
    functionName: "loans",
    args: [loanId],
  });

  const isFullyRepaid = loanData.principal === 0n;

  await context.db.update(Loan, { id: loanId.toString() }).set({
    principal: loanData.principal,
    unpaidInterest: loanData.unpaidInterest,
    lastAccrualTs: loanData.lastAccrualTs,
    status: isFullyRepaid ? "REPAID" : "ACTIVE",
  });

  await context.db.update(Borrower, { id: loanData.borrower }).set((prev) => ({
    totalDebt: prev.totalDebt - principalRepaid,
    lastUpdated: Number(event.block.timestamp),
  }));

  await context.db.insert(LoanEvent).values({
    id: event.log.id,
    loanId: loanId.toString(),
    type: "REPAID",
    principal: principalRepaid,
    interest: interestPaid,
    timestamp: Number(event.block.timestamp),
    txHash: event.transaction.hash,
  });
});

ponder.on("FundingBook:Liquidated", async ({ event, context }) => {
  const { loanId, principalCovered, interestCovered } = event.args;

  await context.db.update(Loan, { id: loanId.toString() }).set({
    status: "LIQUIDATED",
  });

  const loan = await context.db.find(Loan, { id: loanId.toString() });
  if (loan) {
    await context.db.update(Borrower, { id: loan.borrower }).set((prev) => ({
      totalDebt: prev.totalDebt - principalCovered,
      lastUpdated: Number(event.block.timestamp),
    }));
  }

  await context.db.insert(LoanEvent).values({
    id: event.log.id,
    loanId: loanId.toString(),
    type: "LIQUIDATED",
    principal: principalCovered,
    interest: interestCovered,
    timestamp: Number(event.block.timestamp),
    txHash: event.transaction.hash,
  });
});
