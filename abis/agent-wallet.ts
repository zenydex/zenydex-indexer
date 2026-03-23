export const AGENT_WALLET_ABI = [
  {
    "type": "event",
    "name": "CycleOpened",
    "inputs": [
      { "name": "cycleId", "type": "uint256", "indexed": true },
      { "name": "usdcAmount", "type": "uint256", "indexed": false }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "CycleClosed",
    "inputs": [
      { "name": "cycleId", "type": "uint256", "indexed": true },
      { "name": "usdcStart", "type": "uint256", "indexed": false },
      { "name": "usdcEnd", "type": "uint256", "indexed": false },
      { "name": "profit", "type": "int256", "indexed": false },
      { "name": "fee", "type": "uint256", "indexed": false }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ForceClosed",
    "inputs": [
      { "name": "cycleId", "type": "uint256", "indexed": true },
      { "name": "caller", "type": "address", "indexed": true }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Paused",
    "inputs": [
      { "name": "by", "type": "address", "indexed": true }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Unpaused",
    "inputs": [
      { "name": "by", "type": "address", "indexed": true }
    ],
    "anonymous": false
  },
] as const;
