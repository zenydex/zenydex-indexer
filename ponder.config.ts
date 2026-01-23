import { createConfig } from "ponder";
import { http } from "viem";
import { FUNDING_BOOK_ABI } from "./abis/funding-book";
import { BORROW_LOGIC_ABI } from "./abis/borrow-logic";

export default createConfig({
  networks: {
    base: {
      chainId: 8453,
      transport: http(process.env.PONDER_RPC_URL_8453),
    },
  },
  contracts: {
    FundingBook: {
      network: "base",
      abi: FUNDING_BOOK_ABI,
      address: process.env.FUNDING_BOOK_ADDRESS as `0x${string}`,
      startBlock: Number(process.env.FUNDING_BOOK_START_BLOCK),
    },
    BorrowingLogic: {
      network: "base",
      abi: BORROW_LOGIC_ABI as Abi,
      address: process.env.BORROW_LOGIC_ADDRESS as `0x${string}`,
      startBlock: Number(process.env.BORROW_LOGIC_START_BLOCK),
    },
  },
});
