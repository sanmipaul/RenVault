# Transaction Service Error Recovery

## Overview
Enhanced transaction service with error recovery, retry logic, and state management.

## Features
- Transaction state management
- Automatic retry with exponential backoff
- Transaction queue with priority handling
- Transaction caching
- Error recovery and persistence
- Comprehensive monitoring

## Components
- `TransactionStateManager` - Manages transaction states
- `TransactionQueue` - Priority-based transaction queue
- `TransactionCache` - Caches signed transactions
- `TransactionMonitor` - Tracks transaction metrics
- `TransactionRecovery` - Persists and recovers pending transactions
- `TransactionTimeout` - Handles transaction timeouts

## Usage
```typescript
import { TransactionService } from './services/transaction/TransactionService';

const service = TransactionService.getInstance();
const details = await service.prepareDepositTransaction(100);
const signed = await service.signDepositTransaction(details);
const txId = await service.broadcastTransaction(signed);
```
