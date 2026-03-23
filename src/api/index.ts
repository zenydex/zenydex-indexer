import { db } from "ponder:api";
import schema from "ponder:schema";
import { Hono } from "hono";
import { client, graphql } from "ponder";
import { cors } from "hono/cors";
import { eq, desc, and, gt, notInArray } from "ponder";
import { createPublicClient, http, erc20Abi } from "viem";
import { base } from "viem/chains";

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006" as const;

const baseClient = createPublicClient({
  chain: base,
  transport: http(process.env.PONDER_RPC_URL_8453 ?? "https://mainnet.base.org"),
});

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
      totalDepositVolume: (BigInt(acc.totalDepositVolume) + (m.totalDepositVolume ?? 0n)).toString(),
      totalWithdrawVolume: (BigInt(acc.totalWithdrawVolume) + (m.totalWithdrawVolume ?? 0n)).toString(),
      totalBorrowVolume: (BigInt(acc.totalBorrowVolume) + (m.totalBorrowVolume ?? 0n)).toString(),
      totalRepaidVolume: (BigInt(acc.totalRepaidVolume) + (m.totalRepaidVolume ?? 0n)).toString(),
      totalLiquidatedVolume: (BigInt(acc.totalLiquidatedVolume) + (m.totalLiquidatedVolume ?? 0n)).toString(),
      totalCollateralDeposited: (BigInt(acc.totalCollateralDeposited) + (m.totalCollateralDeposited ?? 0n)).toString(),
      totalCollateralWithdrawn: (BigInt(acc.totalCollateralWithdrawn) + (m.totalCollateralWithdrawn ?? 0n)).toString(),
      totalAgentCycleVolume: (BigInt(acc.totalAgentCycleVolume) + (m.totalAgentCycleVolume ?? 0n)).toString(),
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
    totalDepositVolume: "0",
    totalWithdrawVolume: "0",
    totalBorrowVolume: "0",
    totalRepaidVolume: "0",
    totalLiquidatedVolume: "0",
    totalCollateralDeposited: "0",
    totalCollateralWithdrawn: "0",
    totalAgentCycleVolume: "0",
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
    totalDepositVolume: m.totalDepositVolume?.toString() ?? "0",
    totalWithdrawVolume: m.totalWithdrawVolume?.toString() ?? "0",
    totalBorrowVolume: m.totalBorrowVolume?.toString() ?? "0",
    totalRepaidVolume: m.totalRepaidVolume?.toString() ?? "0",
    totalLiquidatedVolume: m.totalLiquidatedVolume?.toString() ?? "0",
    totalCollateralDeposited: m.totalCollateralDeposited?.toString() ?? "0",
    totalCollateralWithdrawn: m.totalCollateralWithdrawn?.toString() ?? "0",
    totalAgentCycleVolume: m.totalAgentCycleVolume?.toString() ?? "0",
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

  // Skip ghost offers from pre-upgrade cancelOffer bug (see docs/BUG-cancelled-offers-resurrection.md)
  const GHOST_OFFERS = ["8453-2", "8453-15"];
  const conditions = [eq(schema.Offer.status, "ACTIVE"), gt(schema.Offer.amount, 0n), notInArray(schema.Offer.id, GHOST_OFFERS)];
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

// REST endpoint for leaderboard
// ?tab=overall|lenders|borrowers  &search=0x...  &chainId=8453
app.get("/api/leaderboard", async (c) => {
  const limit = parseInt(c.req.query("limit") ?? "50");
  const chainId = c.req.query("chainId");
  const tab = c.req.query("tab") ?? "overall";
  const search = c.req.query("search")?.toLowerCase();

  const conditions = [];
  if (chainId) conditions.push(eq(schema.UserPoints.chainId, Number(chainId)));
  // Filter out zero-point entries
  if (conditions.length > 0) {
    // conditions already has chainId
  }

  // Choose sort column based on tab
  const sortCol = tab === "lenders"
    ? desc(schema.UserPoints.lendingPoints)
    : tab === "borrowers"
    ? desc(schema.UserPoints.borrowingPoints)
    : desc(schema.UserPoints.points);

  let rows = await db
    .select()
    .from(schema.UserPoints)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sortCol)
    .limit(search ? 200 : limit); // fetch more if searching

  // Filter by search (address prefix/suffix match)
  if (search) {
    rows = rows.filter((r) => r.address?.toLowerCase().includes(search));
    rows = rows.slice(0, limit);
  }

  // Calculate avg duration per user from actual Loan records
  const allLoans = await db
    .select()
    .from(schema.Loan)
    .where(chainId ? eq(schema.Loan.chainId, Number(chainId)) : undefined);

  // Build per-address avg duration map
  const durationMap = new Map<string, { totalSecs: number; count: number }>();
  const now = Math.floor(Date.now() / 1000);
  for (const loan of allLoans) {
    const addr = loan.borrower?.toLowerCase();
    if (!addr || !loan.startTs) continue;
    const endTs = loan.status === "ACTIVE" ? now : (loan.endTs ?? now);
    const durSecs = endTs - loan.startTs;
    if (durSecs <= 0) continue;
    const existing = durationMap.get(addr) ?? { totalSecs: 0, count: 0 };
    existing.totalSecs += durSecs;
    existing.count += 1;
    durationMap.set(addr, existing);

    // Also count for lender
    const lenderAddr = loan.lender?.toLowerCase();
    if (lenderAddr) {
      const lExisting = durationMap.get(lenderAddr) ?? { totalSecs: 0, count: 0 };
      lExisting.totalSecs += durSecs;
      lExisting.count += 1;
      durationMap.set(lenderAddr, lExisting);
    }
  }

  return c.json(
    rows.map((r, i) => {
      const addr = r.address?.toLowerCase() ?? "";
      const durData = durationMap.get(addr);
      const avgDurationDays = durData && durData.count > 0
        ? Math.round(durData.totalSecs / durData.count / 86400)
        : 0;
      return {
        rank: i + 1,
        address: r.address,
        points: r.points?.toString() ?? "0",
        lendingPoints: r.lendingPoints?.toString() ?? "0",
        borrowingPoints: r.borrowingPoints?.toString() ?? "0",
        bonusPoints: r.bonusPoints?.toString() ?? "0",
        borrowVolume: r.borrowVolume?.toString() ?? "0",
        lendVolume: r.lendVolume?.toString() ?? "0",
        totalLoans: r.totalLoans ?? 0,
        totalOffers: r.totalOffers ?? 0,
        avgDurationDays,
        lastUpdated: r.lastUpdated ?? 0,
      };
    })
  );
});

// ============ Agent Platform Endpoints ============

// Agent leaderboard — ranked by total profit
app.get("/api/agents/leaderboard", async (c) => {
  const limit = parseInt(c.req.query("limit") ?? "50");
  const chainId = c.req.query("chainId");

  const conditions = [];
  if (chainId) conditions.push(eq(schema.Agent.chainId, Number(chainId)));

  const agents = await db
    .select()
    .from(schema.Agent)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(schema.Agent.totalProfit))
    .limit(limit);

  return c.json(
    agents.map((a, i) => ({
      rank: i + 1,
      address: a.address,
      owner: a.owner,
      status: a.status,
      totalCycles: a.totalCycles ?? 0,
      winningCycles: a.winningCycles ?? 0,
      winRate:
        (a.totalCycles ?? 0) > 0
          ? Math.round(((a.winningCycles ?? 0) / (a.totalCycles ?? 1)) * 100)
          : 0,
      totalProfit: a.totalProfit?.toString() ?? "0",
      totalFees: a.totalFees?.toString() ?? "0",
      deployedAt: a.deployedAt ?? 0,
      lastActivityAt: a.lastActivityAt ?? 0,
    }))
  );
});

// Cycle history for a specific agent
app.get("/api/agents/cycles", async (c) => {
  const agent = c.req.query("agent")?.toLowerCase();
  if (!agent) return c.json({ error: "agent param required" }, 400);

  const limit = Math.min(parseInt(c.req.query("limit") ?? "20"), 100);
  const chainId = c.req.query("chainId") ?? "8453";
  const agentHex = agent as `0x${string}`;

  const cycles = await db
    .select()
    .from(schema.AgentCycle)
    .where(
      and(
        eq(schema.AgentCycle.agentAddress, agentHex),
        eq(schema.AgentCycle.chainId, Number(chainId))
      )
    )
    .orderBy(desc(schema.AgentCycle.openedAt))
    .limit(limit);

  return c.json(
    cycles.map((c) => ({
      cycleId: c.cycleId,
      status: c.status,
      usdcStart: c.usdcStart?.toString() ?? "0",
      usdcEnd: c.usdcEnd?.toString() ?? "0",
      profit: c.profit?.toString() ?? "0",
      fee: c.fee?.toString() ?? "0",
      openedAt: c.openedAt ?? 0,
      closedAt: c.closedAt ?? 0,
      txHashOpen: c.txHashOpen,
      txHashClose: c.txHashClose,
    }))
  );
});

// ============ TVL Snapshot (cached, refreshed every 5 min) ============

const FUNDING_BOOK = "0xF1e4944cd45ED647c57A10B3D88D974d84E68145" as const;
const COLLATERAL = "0x604b9926E40fD04A5145122930408b13243cD2Bb" as const;
const BATCH_SIZE = 100; // agents per multicall batch
const TVL_REFRESH_MS = 5 * 60 * 1000; // 5 minutes

interface TvlSnapshot {
  fundingBookUsdc: string;
  collateralWeth: string;
  agentUsdc: string;
  agentWeth: string;
  totalUsdc: string;
  totalWeth: string;
  agentCount: number;
  updatedAt: number;
}

let tvlCache: TvlSnapshot | null = null;
let tvlRefreshing = false;

async function refreshTvl() {
  if (tvlRefreshing) return;
  tvlRefreshing = true;
  try {
    // 1. Core protocol balances
    const coreResults = await baseClient.multicall({
      contracts: [
        { address: USDC_ADDRESS, abi: erc20Abi, functionName: "balanceOf", args: [FUNDING_BOOK] },
        { address: WETH_ADDRESS, abi: erc20Abi, functionName: "balanceOf", args: [COLLATERAL] },
      ],
    });
    const fundingBookUsdc = coreResults[0]?.status === "success" ? (coreResults[0].result as bigint) : 0n;
    const collateralWeth = coreResults[1]?.status === "success" ? (coreResults[1].result as bigint) : 0n;

    // 2. All agent addresses
    const agents = await db
      .select({ address: schema.Agent.address })
      .from(schema.Agent)
      .where(eq(schema.Agent.chainId, 8453));

    // 3. Batch multicall agent balances
    let agentUsdc = 0n;
    let agentWeth = 0n;

    for (let i = 0; i < agents.length; i += BATCH_SIZE) {
      const batch = agents.slice(i, i + BATCH_SIZE);
      const calls = batch.flatMap((a) => [
        { address: USDC_ADDRESS, abi: erc20Abi, functionName: "balanceOf" as const, args: [a.address!] },
        { address: WETH_ADDRESS, abi: erc20Abi, functionName: "balanceOf" as const, args: [a.address!] },
      ]);
      const results = await baseClient.multicall({ contracts: calls });
      for (let j = 0; j < results.length; j += 2) {
        const usdcResult = results[j];
        const wethResult = results[j + 1];
        if (usdcResult && usdcResult.status === "success") agentUsdc += usdcResult.result as bigint;
        if (wethResult && wethResult.status === "success") agentWeth += wethResult.result as bigint;
      }
    }

    tvlCache = {
      fundingBookUsdc: fundingBookUsdc.toString(),
      collateralWeth: collateralWeth.toString(),
      agentUsdc: agentUsdc.toString(),
      agentWeth: agentWeth.toString(),
      totalUsdc: (fundingBookUsdc + agentUsdc).toString(),
      totalWeth: (collateralWeth + agentWeth).toString(),
      agentCount: agents.length,
      updatedAt: Date.now(),
    };
  } catch (err) {
    console.error("TVL refresh failed:", err);
  } finally {
    tvlRefreshing = false;
  }
}

// Start background refresh loop
setInterval(refreshTvl, TVL_REFRESH_MS);
// Initial refresh after 5s (let Ponder boot first)
setTimeout(refreshTvl, 5_000);

// Serve cached TVL snapshot
app.get("/api/tvl", async (c) => {
  if (!tvlCache) {
    // First request before cache is ready — do a sync refresh
    await refreshTvl();
  }
  if (!tvlCache) {
    return c.json({
      fundingBookUsdc: "0", collateralWeth: "0",
      agentUsdc: "0", agentWeth: "0",
      totalUsdc: "0", totalWeth: "0",
      agentCount: 0, updatedAt: 0,
    });
  }
  return c.json(tvlCache);
});

app.use("/", graphql({ db, schema }));
app.use("/graphql", graphql({ db, schema }));

export default app;
