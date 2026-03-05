import { createConfig } from "ponder";
import { FUNDING_BOOK_ABI } from "./abis/funding-book";
import { BORROW_LOGIC_ABI } from "./abis/borrow-logic";

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
  },
});
