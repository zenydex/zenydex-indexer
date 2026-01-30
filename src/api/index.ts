import { db } from "ponder:api";
import schema from "ponder:schema";
import { Hono } from "hono";
import { client, graphql } from "ponder";
import { cors } from "hono/cors";
import { eq, desc, sql } from "ponder";

const app = new Hono();

// Enable CORS for all routes
app.use("*", cors());

app.use("/sql/*", client({ db, schema }));

// REST endpoint for protocol metrics
app.get("/api/metrics", async (c) => {
  const metrics = await db.select().from(schema.ProtocolMetrics).where(eq(schema.ProtocolMetrics.id, "GLOBAL")).limit(1);

  if (metrics.length === 0) {
    return c.json({
      tvl: "0",
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
    });
  }

  const m = metrics[0]!;
  return c.json({
    tvl: m.totalValueLocked?.toString() ?? "0",
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
  });
});

// REST endpoint for top borrowers
app.get("/api/top-borrowers", async (c) => {
  const limit = parseInt(c.req.query("limit") ?? "10");
  const borrowers = await db
    .select()
    .from(schema.Borrower)
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
  const offers = await db
    .select()
    .from(schema.Offer)
    .where(eq(schema.Offer.status, "ACTIVE"))
    .orderBy(desc(schema.Offer.createdAt))
    .limit(limit);

  return c.json(
    offers.map((o) => ({
      id: o.id,
      lender: o.lender,
      asset: o.asset,
      amount: o.amount?.toString() ?? "0",
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
  const loans = await db
    .select()
    .from(schema.Loan)
    .where(eq(schema.Loan.status, "ACTIVE"))
    .orderBy(desc(schema.Loan.createdAt))
    .limit(limit);

  return c.json(
    loans.map((l) => ({
      id: l.id,
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

  const loanEvents = await db
    .select()
    .from(schema.LoanEvent)
    .orderBy(desc(schema.LoanEvent.timestamp))
    .limit(limit);

  const collateralEvents = await db
    .select()
    .from(schema.CollateralEvent)
    .orderBy(desc(schema.CollateralEvent.timestamp))
    .limit(limit);

  const allEvents = [
    ...loanEvents.map((e) => ({
      type: "loan",
      eventType: e.type,
      loanId: e.loanId,
      principal: e.principal?.toString() ?? "0",
      interest: e.interest?.toString() ?? "0",
      timestamp: e.timestamp ?? 0,
      txHash: e.txHash,
    })),
    ...collateralEvents.map((e) => ({
      type: "collateral",
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

app.use("/", graphql({ db, schema }));
app.use("/graphql", graphql({ db, schema }));

export default app;
