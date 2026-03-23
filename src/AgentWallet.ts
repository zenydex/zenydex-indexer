import { ponder } from "ponder:registry";
import { Agent, AgentCycle, ProtocolMetrics } from "../ponder.schema";

function metricsId(chainId: number) {
  return `GLOBAL-${chainId}`;
}

ponder.on("AgentWallet:CycleOpened", async ({ event, context }) => {
  const chainId = context.chain.id;
  const agentAddress = event.log.address.toLowerCase() as `0x${string}`;
  const { cycleId, usdcAmount } = event.args;
  const timestamp = Number(event.block.timestamp);
  const cycleNum = Number(cycleId);
  const agentId = `${chainId}-${agentAddress}`;
  const cycleRecordId = `${agentId}-${cycleNum}`;

  await context.db.insert(AgentCycle).values({
    id: cycleRecordId,
    chainId,
    agentAddress,
    cycleId: cycleNum,
    status: "OPEN",
    usdcStart: usdcAmount,
    usdcEnd: 0n,
    profit: 0n,
    fee: 0n,
    openedAt: timestamp,
    closedAt: 0,
    txHashOpen: event.transaction.hash,
    txHashClose: "0x0000000000000000000000000000000000000000000000000000000000000000",
  }).onConflictDoNothing();

  // Update agent status
  await context.db.update(Agent, { id: agentId }).set({
    status: "IN_POSITION",
    currentCycleId: cycleNum,
    lastActivityAt: timestamp,
  });

  // Track agent cycle volume (USDC entering the cycle)
  const existing = await context.db.find(ProtocolMetrics, { id: metricsId(chainId) });
  if (existing) {
    await context.db.update(ProtocolMetrics, { id: metricsId(chainId) }).set((prev) => ({
      totalAgentCycleVolume: (prev.totalAgentCycleVolume ?? 0n) + usdcAmount,
      lastUpdated: timestamp,
    }));
  }
});

ponder.on("AgentWallet:CycleClosed", async ({ event, context }) => {
  const chainId = context.chain.id;
  const agentAddress = event.log.address.toLowerCase() as `0x${string}`;
  const { cycleId, usdcStart, usdcEnd, profit, fee } = event.args;
  const timestamp = Number(event.block.timestamp);
  const cycleNum = Number(cycleId);
  const agentId = `${chainId}-${agentAddress}`;
  const cycleRecordId = `${agentId}-${cycleNum}`;

  // Update cycle record
  await context.db.update(AgentCycle, { id: cycleRecordId }).set({
    status: "CLOSED",
    usdcStart,
    usdcEnd,
    profit,
    fee,
    closedAt: timestamp,
    txHashClose: event.transaction.hash,
  });

  // Update agent aggregate stats
  const isWin = profit > 0n;
  await context.db.update(Agent, { id: agentId }).set((prev) => ({
    status: "IDLE",
    totalCycles: (prev.totalCycles ?? 0) + 1,
    winningCycles: (prev.winningCycles ?? 0) + (isWin ? 1 : 0),
    totalProfit: (prev.totalProfit ?? 0n) + profit,
    totalFees: (prev.totalFees ?? 0n) + fee,
    lastActivityAt: timestamp,
  }));

  // Track agent cycle volume (USDC exiting the cycle)
  const existing = await context.db.find(ProtocolMetrics, { id: metricsId(chainId) });
  if (existing) {
    await context.db.update(ProtocolMetrics, { id: metricsId(chainId) }).set((prev) => ({
      totalAgentCycleVolume: (prev.totalAgentCycleVolume ?? 0n) + usdcEnd,
      lastUpdated: timestamp,
    }));
  }
});

ponder.on("AgentWallet:ForceClosed", async ({ event, context }) => {
  const chainId = context.chain.id;
  const agentAddress = event.log.address.toLowerCase() as `0x${string}`;
  const { cycleId } = event.args;
  const timestamp = Number(event.block.timestamp);
  const cycleNum = Number(cycleId);
  const agentId = `${chainId}-${agentAddress}`;
  const cycleRecordId = `${agentId}-${cycleNum}`;

  // ForceClosed doesn't emit profit data — read from the cycle record
  const cycle = await context.db.find(AgentCycle, { id: cycleRecordId });

  await context.db.update(AgentCycle, { id: cycleRecordId }).set({
    status: "FORCE_CLOSED",
    closedAt: timestamp,
    txHashClose: event.transaction.hash,
  });

  await context.db.update(Agent, { id: agentId }).set((prev) => ({
    status: "IDLE",
    totalCycles: (prev.totalCycles ?? 0) + 1,
    lastActivityAt: timestamp,
  }));
});

ponder.on("AgentWallet:Paused", async ({ event, context }) => {
  const chainId = context.chain.id;
  const agentAddress = event.log.address.toLowerCase() as `0x${string}`;
  const agentId = `${chainId}-${agentAddress}`;

  await context.db.update(Agent, { id: agentId }).set({
    status: "PAUSED",
    lastActivityAt: Number(event.block.timestamp),
  });
});

ponder.on("AgentWallet:Unpaused", async ({ event, context }) => {
  const chainId = context.chain.id;
  const agentAddress = event.log.address.toLowerCase() as `0x${string}`;
  const agentId = `${chainId}-${agentAddress}`;

  await context.db.update(Agent, { id: agentId }).set({
    status: "IDLE",
    lastActivityAt: Number(event.block.timestamp),
  });
});
