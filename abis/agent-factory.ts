export const AGENT_FACTORY_ABI = [
  {
    "type": "event",
    "name": "AgentDeployed",
    "inputs": [
      { "name": "owner", "type": "address", "indexed": true },
      { "name": "agent", "type": "address", "indexed": true },
      { "name": "index", "type": "uint256", "indexed": false },
      { "name": "treasury", "type": "address", "indexed": false },
      { "name": "executor", "type": "address", "indexed": false }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "AgentDeregistered",
    "inputs": [
      { "name": "owner", "type": "address", "indexed": true },
      { "name": "agent", "type": "address", "indexed": true }
    ],
    "anonymous": false
  },
] as const;
