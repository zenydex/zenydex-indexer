import { ponder } from "ponder:registry";
import { Offer, Loan, Borrower, OfferEvent, LoanEvent, ProtocolMetrics, User } from "../ponder.schema";

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

async function ensureUser(context: any, address: `0x${string}`, timestamp: number) {
  const existing = await context.db.find(User, { id: address });
  if (!existing) {
    await context.db.insert(User).values({
      id: address,
      isLender: false,
      isBorrower: false,
      activeLoansAsBorrower: 0,
      activeOffersAsLender: 0,
      firstSeenAt: timestamp,
      lastActiveAt: timestamp,
    });
    return null;
  }
  return existing;
}

ponder.on("FundingBook:OfferCreated", async ({ event, context }) => {
  const { id, offer } = event.args;
  const timestamp = Number(event.block.timestamp);

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
    createdAt: timestamp,
  });

  await context.db.insert(OfferEvent).values({
    id: event.log.logIndex.toString(),
    offerId: id.toString(),
    type: "CREATED",
    amount: offer.amount,
    timestamp,
    txHash: event.transaction.hash,
  });

  // Track user as lender
  const existingUser = await ensureUser(context, offer.lender, timestamp);
  const isNewLender = !existingUser || !existingUser.isLender;

  await context.db.update(User, { id: offer.lender }).set((prev) => ({
    isLender: true,
    activeOffersAsLender: (prev.activeOffersAsLender ?? 0) + 1,
    lastActiveAt: timestamp,
  }));

  // Update protocol metrics
  await ensureProtocolMetrics(context, timestamp);
  await context.db.update(ProtocolMetrics, { id: GLOBAL_ID }).set((prev) => ({
    activeOffers: (prev.activeOffers ?? 0) + 1,
    totalOffers: (prev.totalOffers ?? 0) + 1,
    activeLenders: isNewLender ? (prev.activeLenders ?? 0) + 1 : prev.activeLenders,
    totalLenders: isNewLender ? (prev.totalLenders ?? 0) + 1 : prev.totalLenders,
    lastUpdated: timestamp,
  }));
});

ponder.on("FundingBook:OfferCanceled", async ({ event, context }) => {
  const { id } = event.args;
  const timestamp = Number(event.block.timestamp);

  const offer = await context.db.find(Offer, { id: id.toString() });

  await context.db.update(Offer, { id: id.toString() }).set({
    status: "CANCELED",
  });

  await context.db.insert(OfferEvent).values({
    id: event.log.logIndex.toString(),
    offerId: id.toString(),
    type: "CANCELED",
    timestamp,
    txHash: event.transaction.hash,
  });

  // Update lender's active offers count
  if (offer) {
    await context.db.update(User, { id: offer.lender! }).set((prev) => ({
      activeOffersAsLender: Math.max(0, (prev.activeOffersAsLender ?? 0) - 1),
      lastActiveAt: timestamp,
    }));

    // Update protocol metrics
    await context.db.update(ProtocolMetrics, { id: GLOBAL_ID }).set((prev) => ({
      activeOffers: Math.max(0, (prev.activeOffers ?? 0) - 1),
      lastUpdated: timestamp,
    }));
  }
});

ponder.on("FundingBook:FundingFilled", async ({ event, context }) => {
  const { offerId, loanId, filled } = event.args;
  const timestamp = Number(event.block.timestamp);

  const offer = await context.db.find(Offer, { id: offerId.toString() });
  let offerFullyFilled = false;
  if (offer) {
    const newAmount = offer.amount! - filled;
    offerFullyFilled = newAmount === 0n;
    await context.db.update(Offer, { id: offerId.toString() }).set({
      amount: newAmount,
      status: offerFullyFilled ? "FILLED" : "ACTIVE",
    });

    // If offer is fully filled, update lender's active offers count
    if (offerFullyFilled) {
      await context.db.update(User, { id: offer.lender! }).set((prev) => ({
        activeOffersAsLender: Math.max(0, (prev.activeOffersAsLender ?? 0) - 1),
        lastActiveAt: timestamp,
      }));
    }
  }

  const loanData = await context.client.readContract({
    abi: context.contracts.FundingBook.abi,
    address: context.contracts.FundingBook.address,
    functionName: "loans",
    args: [loanId],
  });

  const borrowerAddress = loanData[1] as `0x${string}`;

  await context.db.insert(Loan).values({
    id: loanId.toString(),
    offerId: offerId.toString(),
    lender: loanData[0],
    borrower: borrowerAddress,
    asset: loanData[2],
    principal: loanData[3],
    ratePerYear: loanData[4],
    startTs: loanData[5],
    endTs: loanData[6],
    lastAccrualTs: loanData[7],
    unpaidInterest: loanData[8],
    autoRenew: loanData[9],
    status: "ACTIVE",
    createdAt: timestamp,
  });

  // Track user as borrower
  const existingUser = await ensureUser(context, borrowerAddress, timestamp);
  const isNewBorrower = !existingUser || !existingUser.isBorrower;
  const hadNoActiveLoans = !existingUser || existingUser.activeLoansAsBorrower === 0;

  await context.db.update(User, { id: borrowerAddress }).set((prev) => ({
    isBorrower: true,
    activeLoansAsBorrower: (prev.activeLoansAsBorrower ?? 0) + 1,
    lastActiveAt: timestamp,
  }));

  // Update borrower's debt if they exist
  const borrower = await context.db.find(Borrower, { id: borrowerAddress });
  if (borrower) {
    await context.db.update(Borrower, { id: borrowerAddress }).set((prev) => ({
      totalDebt: (prev.totalDebt ?? 0n) + filled,
      lastUpdated: timestamp,
    }));
  }

  await context.db.insert(LoanEvent).values({
    id: event.log.logIndex.toString(),
    loanId: loanId.toString(),
    type: "FILLED",
    principal: filled,
    timestamp,
    txHash: event.transaction.hash,
  });

  // Update protocol metrics
  await ensureProtocolMetrics(context, timestamp);
  await context.db.update(ProtocolMetrics, { id: GLOBAL_ID }).set((prev) => ({
    totalBorrowVolume: (prev.totalBorrowVolume ?? 0n) + filled,
    activeLoans: (prev.activeLoans ?? 0) + 1,
    totalLoans: (prev.totalLoans ?? 0) + 1,
    activeBorrowers: hadNoActiveLoans ? (prev.activeBorrowers ?? 0) + 1 : prev.activeBorrowers,
    totalBorrowers: isNewBorrower ? (prev.totalBorrowers ?? 0) + 1 : prev.totalBorrowers,
    activeOffers: offerFullyFilled ? Math.max(0, (prev.activeOffers ?? 0) - 1) : prev.activeOffers,
    lastUpdated: timestamp,
  }));
});

ponder.on("FundingBook:Repaid", async ({ event, context }) => {
  const { loanId, principalRepaid, interestPaid } = event.args;
  const timestamp = Number(event.block.timestamp);

  const loanData = await context.client.readContract({
    abi: context.contracts.FundingBook.abi,
    address: context.contracts.FundingBook.address,
    functionName: "loans",
    args: [loanId],
  });

  const borrowerAddress = loanData[1] as `0x${string}`;
  const isFullyRepaid = loanData[3] === 0n;

  await context.db.update(Loan, { id: loanId.toString() }).set({
    principal: loanData[3],
    unpaidInterest: loanData[8],
    lastAccrualTs: loanData[7],
    status: isFullyRepaid ? "REPAID" : "ACTIVE",
  });

  await context.db.update(Borrower, { id: borrowerAddress }).set((prev) => ({
    totalDebt: (prev.totalDebt ?? 0n) - principalRepaid,
    lastUpdated: timestamp,
  }));

  await context.db.insert(LoanEvent).values({
    id: event.log.logIndex.toString(),
    loanId: loanId.toString(),
    type: "REPAID",
    principal: principalRepaid,
    interest: interestPaid,
    timestamp,
    txHash: event.transaction.hash,
  });

  // Update user and protocol metrics if loan is fully repaid
  if (isFullyRepaid) {
    const user = await context.db.find(User, { id: borrowerAddress });
    const willHaveNoActiveLoans = user && user.activeLoansAsBorrower === 1;

    await context.db.update(User, { id: borrowerAddress }).set((prev) => ({
      activeLoansAsBorrower: Math.max(0, (prev.activeLoansAsBorrower ?? 0) - 1),
      lastActiveAt: timestamp,
    }));

    await context.db.update(ProtocolMetrics, { id: GLOBAL_ID }).set((prev) => ({
      activeLoans: Math.max(0, (prev.activeLoans ?? 0) - 1),
      totalRepaidVolume: (prev.totalRepaidVolume ?? 0n) + principalRepaid,
      totalInterestPaid: (prev.totalInterestPaid ?? 0n) + interestPaid,
      activeBorrowers: willHaveNoActiveLoans ? Math.max(0, (prev.activeBorrowers ?? 0) - 1) : prev.activeBorrowers,
      lastUpdated: timestamp,
    }));
  } else {
    // Partial repayment - still track volume and interest
    await context.db.update(ProtocolMetrics, { id: GLOBAL_ID }).set((prev) => ({
      totalRepaidVolume: (prev.totalRepaidVolume ?? 0n) + principalRepaid,
      totalInterestPaid: (prev.totalInterestPaid ?? 0n) + interestPaid,
      lastUpdated: timestamp,
    }));
  }
});

ponder.on("FundingBook:Liquidated", async ({ event, context }) => {
  const { loanId, principalCovered, interestCovered } = event.args;
  const timestamp = Number(event.block.timestamp);

  await context.db.update(Loan, { id: loanId.toString() }).set({
    status: "LIQUIDATED",
  });

  const loan = await context.db.find(Loan, { id: loanId.toString() });
  if (loan) {
    const borrowerAddress = loan.borrower!;

    await context.db.update(Borrower, { id: borrowerAddress }).set((prev) => ({
      totalDebt: (prev.totalDebt ?? 0n) - principalCovered,
      lastUpdated: timestamp,
    }));

    // Update user's active loans count
    const user = await context.db.find(User, { id: borrowerAddress });
    const willHaveNoActiveLoans = user && user.activeLoansAsBorrower === 1;

    await context.db.update(User, { id: borrowerAddress }).set((prev) => ({
      activeLoansAsBorrower: Math.max(0, (prev.activeLoansAsBorrower ?? 0) - 1),
      lastActiveAt: timestamp,
    }));

    // Update protocol metrics
    await context.db.update(ProtocolMetrics, { id: GLOBAL_ID }).set((prev) => ({
      activeLoans: Math.max(0, (prev.activeLoans ?? 0) - 1),
      totalLiquidatedVolume: (prev.totalLiquidatedVolume ?? 0n) + principalCovered,
      activeBorrowers: willHaveNoActiveLoans ? Math.max(0, (prev.activeBorrowers ?? 0) - 1) : prev.activeBorrowers,
      lastUpdated: timestamp,
    }));
  }

  await context.db.insert(LoanEvent).values({
    id: event.log.logIndex.toString(),
    loanId: loanId.toString(),
    type: "LIQUIDATED",
    principal: principalCovered,
    interest: interestCovered,
    timestamp,
    txHash: event.transaction.hash,
  });
});
