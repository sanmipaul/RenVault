# Governance System

## Overview
Advanced governance system for RenVault DAO with proposal management, voting delegation, treasury management, and automated execution.

## Features
- **Proposal Management**: Create and manage governance proposals
- **Voting System**: Stake-weighted voting with delegation support
- **Treasury Management**: DAO fund management with budgets
- **Delegation**: Vote delegation to trusted representatives
- **Automated Execution**: Automatic proposal execution

## Governance Process
1. **Proposal Creation**: Community members create proposals
2. **Voting Period**: 24-hour voting window
3. **Vote Delegation**: Users can delegate voting power
4. **Execution**: Passed proposals are automatically executed

## Voting Power
- Based on staking balance (1 power per 1M STX)
- Minimum 1 voting power per user
- Delegation increases representative power
- Real-time power calculation

## Usage

### Start Governance
```bash
node scripts/start-governance.js
```

### API Endpoints
- `POST /api/proposals` - Create proposal
- `GET /api/proposals` - List active proposals
- `POST /api/vote` - Vote on proposal
- `POST /api/delegate` - Delegate voting power
- `GET /api/voting-power/:user` - Check voting power
- `GET /api/top-voters` - Top voters list

## Treasury Features
- Automated fee collection
- Budget allocation by category
- Spending tracking and limits
- Transaction history
- Balance management