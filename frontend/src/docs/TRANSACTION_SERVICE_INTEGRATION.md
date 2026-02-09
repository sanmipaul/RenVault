# Transaction Service Integration Guide

## Quick Start

```typescript
import { TransactionService } from './services/transaction/TransactionService';

const service = TransactionService.getInstance();

// Prepare transaction
const details = await service.prepareDepositTransaction(100);

// Sign transaction
const signed = await service.signDepositTransaction(details);

// Broadcast with automatic retry
const txId = await service.broadcastTransaction(signed);

// Monitor transaction state
const state = service.getTransactionState(txId);

// Get metrics
const metrics = service.getMetrics();
```

## Features

- Automatic retry with exponential backoff
- Transaction state management
- Error recovery and persistence
- Rate limiting
- Batch processing
- Comprehensive logging
- Real-time event emission

## Error Handling

All errors are wrapped in WalletError with specific error codes for proper handling.
