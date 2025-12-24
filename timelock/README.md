# Timelock System

## Overview
Comprehensive timelock system for RenVault protocol with delayed execution, automated scheduling, and governance integration.

## Features
- **Delayed Execution**: Configurable delay periods for critical operations
- **Automated Scheduling**: Background scheduler for transaction execution
- **Cancellation Support**: Cancel queued transactions before execution
- **Flexible Delays**: Preset and custom delay configurations
- **Governance Integration**: Secure governance proposal execution

## Delay Presets
- **1hour**: 1 hour delay
- **6hours**: 6 hours delay
- **12hours**: 12 hours delay
- **1day**: 24 hours delay (default)
- **3days**: 3 days delay
- **1week**: 7 days delay
- **2weeks**: 14 days delay
- **1month**: 30 days delay

## Usage

### Start Timelock System
```bash
node scripts/start-timelock.js
```

### API Endpoints
- `POST /api/timelock/queue` - Queue transaction for delayed execution
- `POST /api/timelock/execute/:txId` - Execute ready transaction
- `POST /api/timelock/cancel/:txId` - Cancel queued transaction
- `GET /api/timelock/transaction/:txId` - Get transaction details
- `GET /api/timelock/scheduled` - List scheduled transactions
- `GET /api/timelock/ready` - List ready transactions
- `GET /api/timelock/history` - Execution history
- `GET /api/timelock/status` - System status

## Configuration
- **Min Delay**: 24 hours (configurable)
- **Max Delay**: 30 days (configurable)
- **Check Interval**: 1 minute
- **Auto-execution**: Enabled by default

## Security Features
- Owner-only transaction queuing
- Minimum delay enforcement
- Cancellation before execution
- Execution history logging
- Automated cleanup of old transactions