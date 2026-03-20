import { ponder } from "ponder:registry";
import { Offer, Loan, Borrower, OfferEvent, LoanEvent, ProtocolMetrics, User, UserPoints } from "../ponder.schema";

function metricsId(chainId: number) {
  return `GLOBAL-${chainId}`;
}

// RiskEngine addresses per chain (for reading ETH price at event time)
const RISK_ENGINE: Record<number, `0x${string}`> = {
  8453: "0xbf9De012f998b429d817fB9b66Cf1435a6c96793",   // Base mainnet
  84532: "0x18c3A02Cbd36c823c09AD200327831D7f6a5C74B",  // Base Sepolia
};
const WETH: Record<number, `0x${string}`> = {
  8453: "0x4200000000000000000000000000000000000006",
  84532: "0x36d89601d157e0Bbc3Ce70EB853E1ccF8d40Eb35",  // MockWETH on Sepolia
};
const GET_PRICE_ABI = [{
  type: "function" as const,
  name: "getPrice",
  inputs: [{ name: "asset", type: "address" as const }],
  outputs: [{ name: "", type: "uint256" as const }],
  stateMutability: "view" as const,
}] as const;

async function readEthPrice(context: any, chainId: number): Promise<bigint> {
  const riskEngine = RISK_ENGINE[chainId];
  const weth = WETH[chainId];
  if (!riskEngine || !weth) return 0n;
  try {
    return await context.client.readContract({
      address: riskEngine,
      abi: GET_PRICE_ABI,
      functionName: "getPrice",
      args: [weth],
    }) as bigint;
  } catch {
    return 0n;
  }
}

// Duration multiplier (scaled by 100): <1d=0, 1-6d=100, 7-13d=125, 14-29d=150, 30-59d=200, 60-89d=250, 90d+=300
function durationMultiplier(durationSecs: number): number {
  const days = durationSecs / 86400;
  if (days < 1) return 0;
  if (days < 7) return 100;
  if (days < 14) return 125;
  if (days < 30) return 150;
  if (days < 60) return 200;
  if (days < 90) return 250;
  return 300;
}

// PnL multiplier (scaled by 100): loss/flat=100, 2-10%=125, 10-25%=150, 25-50%=200, 50%+=250
function pnlMultiplier(pnlBps: number, liquidated: boolean): number {
  if (liquidated) return 100; // duration applies, no PnL bonus
  const pct = pnlBps / 100;
  if (pct < 2) return 100;
  if (pct < 10) return 125;
  if (pct < 25) return 150;
  if (pct < 50) return 200;
  return 250;
}

// Lending points: (USDC amount × 10) × duration multiplier
// amount is in 6-decimal USDC, so divide by 1e6 to get USDC, then × 10
function calcLendingPoints(amount: bigint, durationSecs: number): bigint {
  const durMul = durationMultiplier(durationSecs);
  if (durMul === 0) return 0n;
  // (amount / 1e6) * 10 * (durMul / 100) = amount * 10 * durMul / (1e6 * 100)
  return (amount * 10n * BigInt(durMul)) / 100_000_000n;
}

// Borrowing points: (USDC amount × 8) × duration multiplier × PnL multiplier
function calcBorrowingPoints(amount: bigint, durationSecs: number, pnlBps: number, liquidated: boolean): bigint {
  const durMul = durationMultiplier(durationSecs);
  if (durMul === 0) return 0n;
  const pnlMul = pnlMultiplier(pnlBps, liquidated);
  // (amount / 1e6) * 8 * (durMul / 100) * (pnlMul / 100)
  return (amount * 8n * BigInt(durMul) * BigInt(pnlMul)) / 10_000_000_000n;
}

// Milestone bonuses
function calcMilestoneBonus(totalLoansAfter: number, totalOffersAfter: number, isFirstLoan: boolean, isFirstOffer: boolean, pnlBps: number, durationSecs: number, isFirstProfitable: boolean, isFirstLongLoan: boolean): bigint {
  let bonus = 0n;
  if (isFirstLoan) bonus += 500n;
  if (isFirstOffer) bonus += 300n;
  if (totalLoansAfter === 5) bonus += 1000n;
  if (totalLoansAfter === 10) bonus += 2500n;
  if (totalLoansAfter === 25) bonus += 5000n;
  if (isFirstLongLoan && durationSecs >= 30 * 86400) bonus += 500n;
  if (isFirstProfitable && pnlBps > 0) bonus += 750n;
  return bonus;
}

// Legacy wrapper for backward compat during transition — calculates total repayment points
function calcRepaymentBonus(amount: bigint, durationSecs: number, pnlBps: number): bigint {
  return calcBorrowingPoints(amount, durationSecs, pnlBps, false);
}

async function awardLoanPoints(
  context: any,
  chainId: number,
  address: `0x${string}`,
  timestamp: number,
  volume: bigint,
  points: bigint,
  durationSecs: number,
  pnlBps: number,
  isBorrower: boolean,
) {
  const id = `${chainId}-${address}`;
  const bv = isBorrower ? volume : 0n;
  const lv = isBorrower ? 0n : volume;
  const bp = isBorrower ? points : 0n;
  const lp = isBorrower ? 0n : points;

  // Check for milestone bonuses
  const existing = await context.db.find(UserPoints, { id });
  const prevLoans = existing?.totalLoans ?? 0;
  const prevBestPnl = existing?.bestPnlBps ?? 0;
  const newLoans = prevLoans + (isBorrower ? 1 : 0);
  const isFirstLoan = isBorrower && prevLoans === 0;
  const isFirstProfitable = isBorrower && pnlBps > 0 && prevBestPnl <= 0;
  const isFirstLongLoan = isBorrower && durationSecs >= 30 * 86400 && (existing?.totalDurationSecs ?? 0n) < BigInt(30 * 86400);
  const bonus = calcMilestoneBonus(newLoans, 0, isFirstLoan, false, pnlBps, durationSecs, isFirstProfitable, isFirstLongLoan);
  const totalPts = points + bonus;

  // Note: totalLoans already incremented at FundingFilled time, don't double-count
  await context.db.insert(UserPoints).values({
    id,
    chainId,
    address,
    borrowVolume: bv,
    lendVolume: lv,
    totalLoans: 0,
    totalOffers: 0,
    points: totalPts,
    lendingPoints: lp,
    borrowingPoints: bp,
    bonusPoints: bonus,
    totalDurationSecs: BigInt(durationSecs),
    bestPnlBps: pnlBps,
    lastUpdated: timestamp,
  }).onConflictDoUpdate((prev: any) => ({
    borrowVolume: (prev.borrowVolume ?? 0n) + bv,
    lendVolume: (prev.lendVolume ?? 0n) + lv,
    points: (prev.points ?? 0n) + totalPts,
    lendingPoints: (prev.lendingPoints ?? 0n) + lp,
    borrowingPoints: (prev.borrowingPoints ?? 0n) + bp,
    bonusPoints: (prev.bonusPoints ?? 0n) + bonus,
    totalDurationSecs: (prev.totalDurationSecs ?? 0n) + BigInt(durationSecs),
    bestPnlBps: Math.max(prev.bestPnlBps ?? 0, pnlBps),
    lastUpdated: timestamp,
  }));
}

// Track offer creation — no instant points, lending points awarded on repayment
async function trackOfferCreated(
  context: any,
  chainId: number,
  address: `0x${string}`,
  amount: bigint,
  timestamp: number,
) {
  const id = `${chainId}-${address}`;
  // Check for first-offer milestone
  const existing = await context.db.find(UserPoints, { id });
  const isFirstOffer = !existing || (existing.totalOffers ?? 0) === 0;
  const bonus = isFirstOffer ? 300n : 0n;

  await context.db.insert(UserPoints).values({
    id,
    chainId,
    address,
    borrowVolume: 0n,
    lendVolume: amount,
    totalLoans: 0,
    totalOffers: 1,
    points: bonus,
    lendingPoints: 0n,
    borrowingPoints: 0n,
    bonusPoints: bonus,
    totalDurationSecs: 0n,
    bestPnlBps: 0,
    lastUpdated: timestamp,
  }).onConflictDoUpdate((prev: any) => ({
    lendVolume: (prev.lendVolume ?? 0n) + amount,
    totalOffers: (prev.totalOffers ?? 0) + 1,
    points: (prev.points ?? 0n) + bonus,
    bonusPoints: (prev.bonusPoints ?? 0n) + bonus,
    lastUpdated: timestamp,
  }));
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

async function ensureUser(context: any, chainId: number, address: `0x${string}`, timestamp: number) {
  const id = `${chainId}-${address}`;
  const existing = await context.db.find(User, { id });
  if (!existing) {
    await context.db.insert(User).values({
      id,
      chainId,
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
  const chainId = context.chain.id;
  const { id, offer } = event.args;
  const timestamp = Number(event.block.timestamp);
  const offerId = `${chainId}-${id}`;

  await context.db.insert(Offer).values({
    id: offerId,
    chainId,
    lender: offer.lender.toLowerCase() as `0x${string}`,
    asset: offer.asset,
    amount: offer.amount,
    originalPrincipal: offer.originalPrincipal,
    ratePerYear: offer.ratePerYear,
    minDuration: offer.minDuration,
    maxDuration: offer.maxDuration,
    autoRenew: offer.autoRenew,
    status: "ACTIVE",
    createdAt: timestamp,
  });

  await context.db.insert(OfferEvent).values({
    id: `${chainId}-${event.transaction.hash}-${event.log.logIndex}`,
    chainId,
    offerId,
    type: "CREATED",
    amount: offer.amount,
    timestamp,
    txHash: event.transaction.hash,
  });

  // Track user as lender
  const lenderAddress = offer.lender.toLowerCase() as `0x${string}`;
  const userId = `${chainId}-${lenderAddress}`;
  const existingUser = await ensureUser(context, chainId, lenderAddress, timestamp);
  const isNewLender = !existingUser || !existingUser.isLender;

  await context.db.update(User, { id: userId }).set((prev) => ({
    isLender: true,
    activeOffersAsLender: (prev.activeOffersAsLender ?? 0) + 1,
    lastActiveAt: timestamp,
  }));

  // Update protocol metrics
  await ensureProtocolMetrics(context, chainId, timestamp);
  await context.db.update(ProtocolMetrics, { id: metricsId(chainId) }).set((prev) => ({
    activeOffers: (prev.activeOffers ?? 0) + 1,
    totalOffers: (prev.totalOffers ?? 0) + 1,
    totalUsdcLocked: (prev.totalUsdcLocked ?? 0n) + offer.amount,
    activeLenders: isNewLender ? (prev.activeLenders ?? 0) + 1 : prev.activeLenders,
    totalLenders: isNewLender ? (prev.totalLenders ?? 0) + 1 : prev.totalLenders,
    lastUpdated: timestamp,
  }));

  // Instant base points for lenders (duration bonus added on repayment)
  await trackOfferCreated(context, chainId, lenderAddress, offer.amount, timestamp);
});

ponder.on("FundingBook:OfferCanceled", async ({ event, context }) => {
  const chainId = context.chain.id;
  const { id } = event.args;
  const timestamp = Number(event.block.timestamp);
  const offerId = `${chainId}-${id}`;

  const offer = await context.db.find(Offer, { id: offerId });

  await context.db.update(Offer, { id: offerId }).set({
    status: "CANCELED",
    amount: 0n,
  });

  await context.db.insert(OfferEvent).values({
    id: `${chainId}-${event.transaction.hash}-${event.log.logIndex}`,
    chainId,
    offerId,
    type: "CANCELED",
    timestamp,
    txHash: event.transaction.hash,
  });

  // Update lender's active offers count
  if (offer) {
    const lenderAddr = (offer.lender! as string).toLowerCase() as `0x${string}`;
    const userId = `${chainId}-${lenderAddr}`;
    await context.db.update(User, { id: userId }).set((prev) => ({
      activeOffersAsLender: Math.max(0, (prev.activeOffersAsLender ?? 0) - 1),
      lastActiveAt: timestamp,
    }));

    // Update protocol metrics — subtract remaining USDC from locked total
    const canceledAmount = offer.amount ?? 0n;
    await context.db.update(ProtocolMetrics, { id: metricsId(chainId) }).set((prev) => ({
      activeOffers: Math.max(0, (prev.activeOffers ?? 0) - 1),
      totalUsdcLocked: (prev.totalUsdcLocked ?? 0n) - canceledAmount,
      lastUpdated: timestamp,
    }));
  }
});

ponder.on("FundingBook:FundingFilled", async ({ event, context }) => {
  const chainId = context.chain.id;
  const { offerId, loanId, filled } = event.args;
  const timestamp = Number(event.block.timestamp);
  const scopedOfferId = `${chainId}-${offerId}`;
  const scopedLoanId = `${chainId}-${loanId}`;

  const offer = await context.db.find(Offer, { id: scopedOfferId });
  let offerFullyFilled = false;
  if (offer) {
    const newAmount = offer.amount! - filled;
    offerFullyFilled = newAmount === 0n;
    await context.db.update(Offer, { id: scopedOfferId }).set({
      amount: newAmount,
      status: offerFullyFilled ? "FILLED" : "ACTIVE",
    });

    // If offer is fully filled, update lender's active offers count
    if (offerFullyFilled) {
      const lenderAddr = (offer.lender! as string).toLowerCase() as `0x${string}`;
      const userId = `${chainId}-${lenderAddr}`;
      await context.db.update(User, { id: userId }).set((prev) => ({
        activeOffersAsLender: Math.max(0, (prev.activeOffersAsLender ?? 0) - 1),
        lastActiveAt: timestamp,
      }));
    }
  }

  const loanData = await context.client.readContract({
    abi: context.contracts.FundingBook.abi,
    address: context.contracts.FundingBook.address as `0x${string}`,
    functionName: "loans",
    args: [loanId],
  });

  const borrowerAddress = (loanData[1] as string).toLowerCase() as `0x${string}`;
  const borrowerScopedId = `${chainId}-${borrowerAddress}`;

  // Read ETH price at borrow time for PnL tracking
  const entryPrice = await readEthPrice(context, chainId);

  await context.db.insert(Loan).values({
    id: scopedLoanId,
    chainId,
    offerId: scopedOfferId,
    lender: (loanData[0] as string).toLowerCase() as `0x${string}`,
    borrower: borrowerAddress,
    asset: loanData[2],
    principal: loanData[3],
    ratePerYear: loanData[4],
    startTs: loanData[5],
    endTs: loanData[6],
    lastAccrualTs: loanData[7],
    unpaidInterest: loanData[8],
    autoRenew: loanData[9],
    entryPrice,
    status: "ACTIVE",
    createdAt: timestamp,
  });

  // Track user as borrower
  const existingUser = await ensureUser(context, chainId, borrowerAddress, timestamp);
  const isNewBorrower = !existingUser || !existingUser.isBorrower;
  const hadNoActiveLoans = !existingUser || existingUser.activeLoansAsBorrower === 0;

  await context.db.update(User, { id: borrowerScopedId }).set((prev) => ({
    isBorrower: true,
    activeLoansAsBorrower: (prev.activeLoansAsBorrower ?? 0) + 1,
    lastActiveAt: timestamp,
  }));

  await context.db.insert(Borrower).values({
    id: borrowerScopedId,
    chainId,
    collateralAmount: 0n,
    totalDebt: filled,
    healthFactor: 0n,
    lastUpdated: timestamp,
  }).onConflictDoUpdate((prev) => ({
    totalDebt: (prev.totalDebt ?? 0n) + filled,
    lastUpdated: timestamp,
  }));

  await context.db.insert(LoanEvent).values({
    id: `${chainId}-${event.transaction.hash}-${event.log.logIndex}`,
    chainId,
    loanId: scopedLoanId,
    type: "FILLED",
    principal: filled,
    timestamp,
    txHash: event.transaction.hash,
  });

  // Update protocol metrics — USDC leaves protocol when borrowed
  await ensureProtocolMetrics(context, chainId, timestamp);
  await context.db.update(ProtocolMetrics, { id: metricsId(chainId) }).set((prev) => ({
    totalBorrowVolume: (prev.totalBorrowVolume ?? 0n) + filled,
    totalUsdcLocked: (prev.totalUsdcLocked ?? 0n) - filled,
    activeLoans: (prev.activeLoans ?? 0) + 1,
    totalLoans: (prev.totalLoans ?? 0) + 1,
    activeBorrowers: hadNoActiveLoans ? (prev.activeBorrowers ?? 0) + 1 : prev.activeBorrowers,
    totalBorrowers: isNewBorrower ? (prev.totalBorrowers ?? 0) + 1 : prev.totalBorrowers,
    activeOffers: offerFullyFilled ? Math.max(0, (prev.activeOffers ?? 0) - 1) : prev.activeOffers,
    lastUpdated: timestamp,
  }));

  // Instant base points at loan creation (1x duration, 1x PnL = minimum)
  // Borrower base: amount / 1e6 * 8 (8 pts per USDC)
  // Lender base: amount / 1e6 * 10 (10 pts per USDC)
  const borrowerBasePts = (filled * 8n) / 1_000_000n;
  const lenderBasePts = (filled * 10n) / 1_000_000n;
  const lenderAddress = (loanData[0] as string).toLowerCase() as `0x${string}`;

  // Award borrower base points + track volume
  await context.db.insert(UserPoints).values({
    id: `${chainId}-${borrowerAddress}`,
    chainId,
    address: borrowerAddress,
    borrowVolume: filled,
    lendVolume: 0n,
    totalLoans: 1,
    totalOffers: 0,
    points: borrowerBasePts,
    lendingPoints: 0n,
    borrowingPoints: borrowerBasePts,
    bonusPoints: 0n,
    totalDurationSecs: 0n,
    bestPnlBps: 0,
    lastUpdated: timestamp,
  }).onConflictDoUpdate((prev: any) => ({
    borrowVolume: (prev.borrowVolume ?? 0n) + filled,
    totalLoans: (prev.totalLoans ?? 0) + 1,
    points: (prev.points ?? 0n) + borrowerBasePts,
    borrowingPoints: (prev.borrowingPoints ?? 0n) + borrowerBasePts,
    lastUpdated: timestamp,
  }));

  // Award lender base points for this loan
  await context.db.insert(UserPoints).values({
    id: `${chainId}-${lenderAddress}`,
    chainId,
    address: lenderAddress,
    borrowVolume: 0n,
    lendVolume: filled,
    totalLoans: 0,
    totalOffers: 0,
    points: lenderBasePts,
    lendingPoints: lenderBasePts,
    borrowingPoints: 0n,
    bonusPoints: 0n,
    totalDurationSecs: 0n,
    bestPnlBps: 0,
    lastUpdated: timestamp,
  }).onConflictDoUpdate((prev: any) => ({
    lendVolume: (prev.lendVolume ?? 0n) + filled,
    points: (prev.points ?? 0n) + lenderBasePts,
    lendingPoints: (prev.lendingPoints ?? 0n) + lenderBasePts,
    lastUpdated: timestamp,
  }));
});

ponder.on("FundingBook:Repaid", async ({ event, context }) => {
  const chainId = context.chain.id;
  const { loanId, principalRepaid, interestPaid } = event.args;
  const timestamp = Number(event.block.timestamp);
  const scopedLoanId = `${chainId}-${loanId}`;

  const loan = await context.db.find(Loan, { id: scopedLoanId });
  if (!loan) return;

  const borrowerAddress = loan.borrower!;
  const borrowerScopedId = `${chainId}-${borrowerAddress}`;
  const newPrincipal = (loan.principal ?? 0n) - principalRepaid;
  const isFullyRepaid = newPrincipal <= 0n;

  await context.db.update(Loan, { id: scopedLoanId }).set({
    principal: isFullyRepaid ? 0n : newPrincipal,
    status: isFullyRepaid ? "REPAID" : "ACTIVE",
  });

  await context.db.insert(Borrower).values({
    id: borrowerScopedId,
    chainId,
    collateralAmount: 0n,
    totalDebt: 0n,
    healthFactor: 0n,
    lastUpdated: timestamp,
  }).onConflictDoUpdate((prev) => ({
    totalDebt: (prev.totalDebt ?? 0n) - principalRepaid,
    lastUpdated: timestamp,
  }));

  await context.db.insert(LoanEvent).values({
    id: `${chainId}-${event.transaction.hash}-${event.log.logIndex}`,
    chainId,
    loanId: scopedLoanId,
    type: "REPAID",
    principal: principalRepaid,
    interest: interestPaid,
    timestamp,
    txHash: event.transaction.hash,
  });

  // Restore offer amount for autoRenew loans
  if (principalRepaid > 0n && loan.offerId) {
    const offer = await context.db.find(Offer, { id: loan.offerId });
    if (offer && offer.autoRenew) {
      await context.db.update(Offer, { id: loan.offerId }).set((prev) => ({
        amount: (prev.amount ?? 0n) + principalRepaid,
        status: "ACTIVE",
      }));
    }
  }

  // Award duration-weighted points on full repayment
  if (isFullyRepaid && loan.startTs) {
    const durationSecs = timestamp - loan.startTs;
    const loanAmount = loan.principal! + principalRepaid; // original principal (current was partially repaid)
    // Actually principal in the DB was the remaining at time of this event — use principalRepaid for this final chunk
    // For the original loan amount, we stored it at creation. The loan's original principal = what we find from the offer.
    // Simplest: use the loan's full borrow amount from the FundingFilled event = we don't have it directly.
    // We can reconstruct: the loan's principal was decremented by partial repays. Since this is the final repay,
    // the original amount = sum of all principalRepaid across events. But we only see this event.
    // Use the Loan's principal at DB read time (before this update) + principalRepaid = original remaining + this chunk.
    // For simplicity, use principalRepaid as the volume for this repay cycle.
    // Actually loan.principal is the value BEFORE this repay, and we're repaying principalRepaid which makes newPrincipal=0.
    // So loan.principal (from DB) = principalRepaid (it's the last chunk). The full original amount would need reconstruction.
    // Let's use (loan.principal ?? 0n) which equals principalRepaid since isFullyRepaid means newPrincipal=0.
    const fullAmount = (loan.principal ?? 0n); // remaining = what we're repaying now (since fully repaid)

    // Read current ETH price for PnL calculation
    const exitPrice = await readEthPrice(context, chainId);
    const entryPrice = loan.entryPrice ?? 0n;

    // PnL in basis points: (exitPrice - entryPrice) / entryPrice * 10000
    let pnlBps = 0;
    if (entryPrice > 0n && exitPrice > 0n) {
      pnlBps = Number(((exitPrice - entryPrice) * 10000n) / entryPrice);
    }

    // Award borrower bonus: full duration/PnL points minus base already given at FundingFilled
    const borrowerFull = calcBorrowingPoints(fullAmount, durationSecs, pnlBps, false);
    const borrowerBaseAlreadyGiven = (fullAmount * 8n) / 1_000_000n;
    const borrowerBonus = borrowerFull > borrowerBaseAlreadyGiven ? borrowerFull - borrowerBaseAlreadyGiven : 0n;
    if (borrowerBonus > 0n) {
      await awardLoanPoints(
        context, chainId,
        loan.borrower! as `0x${string}`,
        timestamp, fullAmount, borrowerBonus, durationSecs, pnlBps, true
      );
    }

    // Award lender bonus: full duration points minus base already given at FundingFilled
    const lenderFull = calcLendingPoints(fullAmount, durationSecs);
    const lenderBaseAlreadyGiven = (fullAmount * 10n) / 1_000_000n;
    const lenderBonus = lenderFull > lenderBaseAlreadyGiven ? lenderFull - lenderBaseAlreadyGiven : 0n;
    if (lenderBonus > 0n && loan.lender) {
      await awardLoanPoints(
        context, chainId,
        loan.lender as `0x${string}`,
        timestamp, fullAmount, lenderBonus, durationSecs, 0, false
      );
    }
  }

  // Update user and protocol metrics if loan is fully repaid
  if (isFullyRepaid) {
    const user = await context.db.find(User, { id: borrowerScopedId });
    const willHaveNoActiveLoans = user && user.activeLoansAsBorrower === 1;

    await context.db.update(User, { id: borrowerScopedId }).set((prev) => ({
      activeLoansAsBorrower: Math.max(0, (prev.activeLoansAsBorrower ?? 0) - 1),
      lastActiveAt: timestamp,
    }));

    await context.db.update(ProtocolMetrics, { id: metricsId(chainId) }).set((prev) => ({
      activeLoans: Math.max(0, (prev.activeLoans ?? 0) - 1),
      totalRepaidVolume: (prev.totalRepaidVolume ?? 0n) + principalRepaid,
      totalInterestPaid: (prev.totalInterestPaid ?? 0n) + interestPaid,
      totalUsdcLocked: (prev.totalUsdcLocked ?? 0n) + principalRepaid,
      activeBorrowers: willHaveNoActiveLoans ? Math.max(0, (prev.activeBorrowers ?? 0) - 1) : prev.activeBorrowers,
      lastUpdated: timestamp,
    }));
  } else {
    // Partial repayment - still track volume and interest
    await context.db.update(ProtocolMetrics, { id: metricsId(chainId) }).set((prev) => ({
      totalRepaidVolume: (prev.totalRepaidVolume ?? 0n) + principalRepaid,
      totalInterestPaid: (prev.totalInterestPaid ?? 0n) + interestPaid,
      totalUsdcLocked: (prev.totalUsdcLocked ?? 0n) + principalRepaid,
      lastUpdated: timestamp,
    }));
  }
});

ponder.on("FundingBook:Liquidated", async ({ event, context }) => {
  const chainId = context.chain.id;
  const { loanId, principalCovered, interestCovered } = event.args;
  const timestamp = Number(event.block.timestamp);
  const scopedLoanId = `${chainId}-${loanId}`;

  await context.db.update(Loan, { id: scopedLoanId }).set({
    status: "LIQUIDATED",
  });

  const loan = await context.db.find(Loan, { id: scopedLoanId });
  if (loan) {
    const borrowerAddress = loan.borrower!;
    const borrowerScopedId = `${chainId}-${borrowerAddress}`;
    const isBorrowerZeroAddress = borrowerAddress === "0x0000000000000000000000000000000000000000";

    if (!isBorrowerZeroAddress) {
      await context.db.insert(Borrower).values({
        id: borrowerScopedId,
        chainId,
        collateralAmount: 0n,
        totalDebt: 0n,
        healthFactor: 0n,
        lastUpdated: timestamp,
      }).onConflictDoUpdate((prev) => ({
        totalDebt: (prev.totalDebt ?? 0n) - principalCovered,
        lastUpdated: timestamp,
      }));

      // Update user's active loans count
      const user = await context.db.find(User, { id: borrowerScopedId });
      const willHaveNoActiveLoans = user && user.activeLoansAsBorrower === 1;

      await context.db.update(User, { id: borrowerScopedId }).set((prev) => ({
        activeLoansAsBorrower: Math.max(0, (prev.activeLoansAsBorrower ?? 0) - 1),
        lastActiveAt: timestamp,
      }));

      // Update protocol metrics — USDC returns to lender via collateral liquidation
      await context.db.update(ProtocolMetrics, { id: metricsId(chainId) }).set((prev) => ({
        activeLoans: Math.max(0, (prev.activeLoans ?? 0) - 1),
        totalLiquidatedVolume: (prev.totalLiquidatedVolume ?? 0n) + principalCovered,
        totalUsdcLocked: (prev.totalUsdcLocked ?? 0n) + principalCovered,
        activeBorrowers: willHaveNoActiveLoans ? Math.max(0, (prev.activeBorrowers ?? 0) - 1) : prev.activeBorrowers,
        lastUpdated: timestamp,
      }));
    } else {
      // Zero address borrower - only update protocol metrics
      await context.db.update(ProtocolMetrics, { id: metricsId(chainId) }).set((prev) => ({
        activeLoans: Math.max(0, (prev.activeLoans ?? 0) - 1),
        totalLiquidatedVolume: (prev.totalLiquidatedVolume ?? 0n) + principalCovered,
        totalUsdcLocked: (prev.totalUsdcLocked ?? 0n) + principalCovered,
        lastUpdated: timestamp,
      }));
    }
  }

  await context.db.insert(LoanEvent).values({
    id: `${chainId}-${event.transaction.hash}-${event.log.logIndex}`,
    chainId,
    loanId: scopedLoanId,
    type: "LIQUIDATED",
    principal: principalCovered,
    interest: interestCovered,
    timestamp,
    txHash: event.transaction.hash,
  });
});
