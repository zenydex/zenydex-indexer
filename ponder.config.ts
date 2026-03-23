import { createConfig, factory } from "ponder";
import { FUNDING_BOOK_ABI } from "./abis/funding-book";
import { BORROW_LOGIC_ABI } from "./abis/borrow-logic";
import { AGENT_FACTORY_ABI } from "./abis/agent-factory";
import { AGENT_WALLET_ABI } from "./abis/agent-wallet";

export default createConfig({
  chains: {
    base: {
      id: 8453,
      rpc: process.env.PONDER_RPC_URL_8453,
    },
    baseSepolia: {
      id: 84532,
      rpc: process.env.PONDER_RPC_URL_84532,
    },
  },
  contracts: {
    FundingBook: {
      abi: FUNDING_BOOK_ABI,
      chain: {
        base: {
          address: process.env.FUNDING_BOOK_ADDRESS as `0x${string}`,
          startBlock: Number(process.env.FUNDING_BOOK_START_BLOCK),
        },
        baseSepolia: {
          address: process.env.FUNDING_BOOK_ADDRESS_TESTNET as `0x${string}`,
          startBlock: Number(process.env.FUNDING_BOOK_START_BLOCK_TESTNET),
        },
      },
    },
    BorrowingLogic: {
      abi: BORROW_LOGIC_ABI,
      chain: {
        base: {
          address: process.env.BORROW_LOGIC_ADDRESS as `0x${string}`,
          startBlock: Number(process.env.BORROW_LOGIC_START_BLOCK),
        },
        baseSepolia: {
          address: process.env.BORROW_LOGIC_ADDRESS_TESTNET as `0x${string}`,
          startBlock: Number(process.env.BORROW_LOGIC_START_BLOCK_TESTNET),
        },
      },
    },
    AgentFactory: {
      abi: AGENT_FACTORY_ABI,
      chain: {
        base: {
          address: process.env.AGENT_FACTORY_ADDRESS as `0x${string}`,
          startBlock: Number(process.env.AGENT_FACTORY_START_BLOCK),
        },
      },
    },
    AgentWallet: {
      abi: AGENT_WALLET_ABI,
      chain: {
        base: {
          address: factory({
            address: process.env.AGENT_FACTORY_ADDRESS as `0x${string}`,
            event: AGENT_FACTORY_ABI[0], // AgentDeployed
            parameter: "agent",
          }),
          startBlock: Number(process.env.AGENT_FACTORY_START_BLOCK),
        },
      },
    },
  },
});
