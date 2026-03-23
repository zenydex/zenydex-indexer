import { ponder } from "ponder:registry";
import { Agent } from "../ponder.schema";

ponder.on("AgentFactory:AgentDeployed", async ({ event, context }) => {
  const chainId = context.chain.id;
  const { owner, agent } = event.args;
  const timestamp = Number(event.block.timestamp);
  const agentId = `${chainId}-${agent.toLowerCase()}`;

  await context.db.insert(Agent).values({
    id: agentId,
    chainId,
    address: agent.toLowerCase() as `0x${string}`,
    owner: owner.toLowerCase() as `0x${string}`,
    status: "IDLE",
    totalCycles: 0,
    winningCycles: 0,
    totalProfit: 0n,
    totalFees: 0n,
    currentCycleId: 0,
    deployedAt: timestamp,
    lastActivityAt: timestamp,
  }).onConflictDoNothing();
});
