import { db } from "ponder:api";
import schema from "ponder:schema";
import { Hono } from "hono";
import { client, graphql } from "ponder";
import { cors } from "hono/cors";
import { eq, desc, and, gt } from "ponder";

const app = new Hono();

// Enable CORS for all routes
app.use("*", cors());

app.use("/sql/*", client({ db, schema }));

// REST endpoint for protocol metrics
app.get("/api/metrics", async (c) => {
  const chainId = c.req.query("chainId");
  const metricsId = chainId ? `GLOBAL-${chainId}` : null;

  if (metricsId) {
    const metrics = await db.select().from(schema.ProtocolMetrics).where(eq(schema.ProtocolMetrics.id, metricsId)).limit(1);

    if (metrics.length === 0) {
      return c.json(emptyMetrics());
    }

    return c.json(formatMetrics(metrics[0]!));
  }

  // No chainId specified - return all metrics rows
  const metrics = await db.select().from(schema.ProtocolMetrics);
  if (metrics.length === 0) {
    return c.json(emptyMetrics());
  }

  // Aggregate across chains
  const aggregated = metrics.reduce(
    (acc, m) => ({
      totalWethLocked: (BigInt(acc.totalWethLocked) + (m.totalWethLocked ?? 0n)).toString(),
      totalUsdcLocked: (BigInt(acc.totalUsdcLocked) + (m.totalUsdcLocked ?? 0n)).toString(),
      totalBorrowVolume: (BigInt(acc.totalBorrowVolume) + (m.totalBorrowVolume ?? 0n)).toString(),
      totalRepaidVolume: (BigInt(acc.totalRepaidVolume) + (m.totalRepaidVolume ?? 0n)).toString(),
      totalLiquidatedVolume: (BigInt(acc.totalLiquidatedVolume) + (m.totalLiquidatedVolume ?? 0n)).toString(),
      activeLoans: acc.activeLoans + (m.activeLoans ?? 0),
      totalLoans: acc.totalLoans + (m.totalLoans ?? 0),
      activeBorrowers: acc.activeBorrowers + (m.activeBorrowers ?? 0),
      totalBorrowers: acc.totalBorrowers + (m.totalBorrowers ?? 0),
      activeLenders: acc.activeLenders + (m.activeLenders ?? 0),
      totalLenders: acc.totalLenders + (m.totalLenders ?? 0),
      activeOffers: acc.activeOffers + (m.activeOffers ?? 0),
      totalOffers: acc.totalOffers + (m.totalOffers ?? 0),
      totalInterestPaid: (BigInt(acc.totalInterestPaid) + (m.totalInterestPaid ?? 0n)).toString(),
      lastUpdated: Math.max(acc.lastUpdated, m.lastUpdated ?? 0),
    }),
    emptyMetrics()
  );

  return c.json(aggregated);
});

function emptyMetrics() {
  return {
    totalWethLocked: "0",
    totalUsdcLocked: "0",
    totalBorrowVolume: "0",
    totalRepaidVolume: "0",
    totalLiquidatedVolume: "0",
    activeLoans: 0,
    totalLoans: 0,
    activeBorrowers: 0,
    totalBorrowers: 0,
    activeLenders: 0,
    totalLenders: 0,
    activeOffers: 0,
    totalOffers: 0,
    totalInterestPaid: "0",
    lastUpdated: 0,
  };
}

function formatMetrics(m: any) {
  return {
    totalWethLocked: m.totalWethLocked?.toString() ?? "0",
    totalUsdcLocked: m.totalUsdcLocked?.toString() ?? "0",
    totalBorrowVolume: m.totalBorrowVolume?.toString() ?? "0",
    totalRepaidVolume: m.totalRepaidVolume?.toString() ?? "0",
    totalLiquidatedVolume: m.totalLiquidatedVolume?.toString() ?? "0",
    activeLoans: m.activeLoans ?? 0,
    totalLoans: m.totalLoans ?? 0,
    activeBorrowers: m.activeBorrowers ?? 0,
    totalBorrowers: m.totalBorrowers ?? 0,
    activeLenders: m.activeLenders ?? 0,
    totalLenders: m.totalLenders ?? 0,
    activeOffers: m.activeOffers ?? 0,
    totalOffers: m.totalOffers ?? 0,
    totalInterestPaid: m.totalInterestPaid?.toString() ?? "0",
    lastUpdated: m.lastUpdated ?? 0,
  };
}

// REST endpoint for top borrowers
app.get("/api/top-borrowers", async (c) => {
  const limit = parseInt(c.req.query("limit") ?? "10");
  const chainId = c.req.query("chainId");

  const conditions = chainId
    ? [eq(schema.Borrower.chainId, Number(chainId))]
    : [];

  const borrowers = await db
    .select()
    .from(schema.Borrower)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(schema.Borrower.totalDebt))
    .limit(limit);

  return c.json(
    borrowers.map((b) => ({
      address: b.id,
      collateralAmount: b.collateralAmount?.toString() ?? "0",
      totalDebt: b.totalDebt?.toString() ?? "0",
      healthFactor: b.healthFactor?.toString() ?? "0",
      lastUpdated: b.lastUpdated ?? 0,
    }))
  );
});

// REST endpoint for active offers
app.get("/api/active-offers", async (c) => {
  const limit = parseInt(c.req.query("limit") ?? "20");
  const chainId = c.req.query("chainId");

  const conditions = [eq(schema.Offer.status, "ACTIVE"), gt(schema.Offer.amount, 0n)];
  if (chainId) conditions.push(eq(schema.Offer.chainId, Number(chainId)));

  const offers = await db
    .select()
    .from(schema.Offer)
    .where(and(...conditions))
    .orderBy(desc(schema.Offer.createdAt))
    .limit(limit);

  return c.json(
    offers.map((o) => ({
      id: o.id,
      chainId: o.chainId,
      lender: o.lender,
      asset: o.asset,
      amount: o.amount?.toString() ?? "0",
      originalPrincipal: o.originalPrincipal?.toString() ?? "0",
      ratePerYear: o.ratePerYear?.toString() ?? "0",
      minDuration: o.minDuration ?? 0,
      maxDuration: o.maxDuration ?? 0,
      autoRenew: o.autoRenew ?? false,
      createdAt: o.createdAt ?? 0,
    }))
  );
});

// REST endpoint for active loans
app.get("/api/active-loans", async (c) => {
  const limit = parseInt(c.req.query("limit") ?? "20");
  const chainId = c.req.query("chainId");

  const conditions = [eq(schema.Loan.status, "ACTIVE")];
  if (chainId) conditions.push(eq(schema.Loan.chainId, Number(chainId)));

  const loans = await db
    .select()
    .from(schema.Loan)
    .where(and(...conditions))
    .orderBy(desc(schema.Loan.createdAt))
    .limit(limit);

  return c.json(
    loans.map((l) => ({
      id: l.id,
      chainId: l.chainId,
      offerId: l.offerId,
      lender: l.lender,
      borrower: l.borrower,
      asset: l.asset,
      principal: l.principal?.toString() ?? "0",
      ratePerYear: l.ratePerYear?.toString() ?? "0",
      startTs: l.startTs ?? 0,
      endTs: l.endTs ?? 0,
      unpaidInterest: l.unpaidInterest?.toString() ?? "0",
      autoRenew: l.autoRenew ?? false,
      createdAt: l.createdAt ?? 0,
    }))
  );
});

// REST endpoint for recent activity
app.get("/api/recent-activity", async (c) => {
  const limit = parseInt(c.req.query("limit") ?? "20");
  const chainId = c.req.query("chainId");

  const loanConditions = chainId
    ? [eq(schema.LoanEvent.chainId, Number(chainId))]
    : [];
  const collateralConditions = chainId
    ? [eq(schema.CollateralEvent.chainId, Number(chainId))]
    : [];

  const loanEvents = await db
    .select()
    .from(schema.LoanEvent)
    .where(loanConditions.length > 0 ? and(...loanConditions) : undefined)
    .orderBy(desc(schema.LoanEvent.timestamp))
    .limit(limit);

  const collateralEvents = await db
    .select()
    .from(schema.CollateralEvent)
    .where(collateralConditions.length > 0 ? and(...collateralConditions) : undefined)
    .orderBy(desc(schema.CollateralEvent.timestamp))
    .limit(limit);

  const allEvents = [
    ...loanEvents.map((e) => ({
      type: "loan",
      chainId: e.chainId,
      eventType: e.type,
      loanId: e.loanId,
      principal: e.principal?.toString() ?? "0",
      interest: e.interest?.toString() ?? "0",
      timestamp: e.timestamp ?? 0,
      txHash: e.txHash,
    })),
    ...collateralEvents.map((e) => ({
      type: "collateral",
      chainId: e.chainId,
      eventType: e.type,
      borrower: e.borrower,
      amount: e.amount?.toString() ?? "0",
      timestamp: e.timestamp ?? 0,
      txHash: e.txHash,
    })),
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);

  return c.json(allEvents);
});

// REST endpoint for leaderboard (points = volume * 100)
app.get("/api/leaderboard", async (c) => {
  const limit = parseInt(c.req.query("limit") ?? "50");
  const chainId = c.req.query("chainId");

  const conditions = chainId
    ? [eq(schema.UserPoints.chainId, Number(chainId))]
    : [];

  const rows = await db
    .select()
    .from(schema.UserPoints)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(schema.UserPoints.points))
    .limit(limit);

  return c.json(
    rows.map((r, i) => ({
      rank: i + 1,
      address: r.address,
      points: r.points?.toString() ?? "0",
      borrowVolume: r.borrowVolume?.toString() ?? "0",
      lendVolume: r.lendVolume?.toString() ?? "0",
      totalLoans: r.totalLoans ?? 0,
      totalOffers: r.totalOffers ?? 0,
      lastUpdated: r.lastUpdated ?? 0,
    }))
  );
});

app.use("/", graphql({ db, schema }));
app.use("/graphql", graphql({ db, schema }));

export default app;
