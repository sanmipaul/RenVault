# WalletKit Sign API v2 Integration Guide

## Overview

This document describes the comprehensive Sign API v2 implementation for RenVault, featuring batch transaction signing, EIP-712 typed data support, hardware wallet integration, multi-signature coordination, and advanced error handling.

## Architecture

### Core Services

```
WalletKitService (facade)
  ↓
walletkit-signing.ts (delegates to AppKit or local services)
  ↓
├─ batch-signing.ts (batch transactions, progress tracking)
├─ eip712-signing.ts (EIP-712 typed data, domain separator)
├─ message-signing.ts (personal_sign, signature verification)
├─ hardware-wallet-signing.ts (Ledger, Trezor, KeepKey)
├─ multi-sig-coordination.ts (multi-signature workflows)
├─ signature-verification.ts (verification & recovery)
├─ transaction-simulation.ts (simulation, gas estimation)
└─ signing-error-handler.ts (error handling, retry logic)
```

## Feature Overview

### 1. Batch Transaction Signing

Sign multiple transactions in a single operation with progress tracking.

**Usage:**
```typescript
import { walletKitSigningService } from '@/services/walletkit-signing';

const response = await walletKitSigningService.signTransactions({
  transactions: [
    { id: 'tx1', data: '0x...', metadata: { to: '0xaddr', value: '1000' } },
    { id: 'tx2', data: '0x...', metadata: { to: '0xaddr2', value: '2000' } },
  ],
  chainId: 'stacks:1',
  topic: 'wc_topic_xyz',
  simulationRequired: true,
  onProgress: (progress) => {
    console.log(`Signed ${progress.progress}%: ${progress.message}`);
  },
});

// Response structure:
// {
//   batchId: 'batch-1234567890-abc123def',
//   signatures: [
//     { requestId: 'tx1', signature: '0x...', timestamp: 1234567890 },
//     { requestId: 'tx2', signature: '0x...', timestamp: 1234567891 },
//   ],
//   failedTransactions: [],
//   totalSigned: 2,
//   totalFailed: 0,
//   timestamp: 1234567890,
// }
```

**Features:**
- Batch up to 100 transactions
- Real-time progress callbacks
- Optional pre-signing simulation
- Automatic retry on transient failures
- Transaction metadata tracking

### 2. EIP-712 Typed Data Signing

Sign structured data for secure off-chain messages (EIP-712 standard).

**Usage:**
```typescript
const typedData = {
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    Order: [
      { name: 'orderID', type: 'uint256' },
      { name: 'orderTime', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'token', type: 'address' },
    ],
  },
  primaryType: 'Order',
  domain: {
    name: 'RenVault',
    version: '1',
    chainId: 1,
    verifyingContract: '0x...',
  },
  message: {
    orderID: 123,
    orderTime: 1704067200,
    amount: '1000000000000000000',
    token: '0xA0b869991C6218b36c1d19D4a2e9Eb0cE3298bA1',
  },
};

const response = await walletKitSigningService.signTypedData({
  typedData,
  account: '0x...',
  chainId: 'stacks:1',
  topic: 'wc_topic_xyz',
});

// Response: { signature: '0x...', typedDataHash: '0x...', timestamp: 1234567890 }
```

**Features:**
- Full EIP-712 domain separator computation
- Type encoding and hashing
- Signature verification
- Caching for repeated signatures

### 3. Personal Message Signing

Sign personal messages for authentication and verification.

**Usage:**
```typescript
const response = await walletKitSigningService.signMessage({
  message: 'Authenticate with RenVault',
  account: '0x...',
  messageType: 'personal_sign',
  displayMessage: 'Sign in to RenVault',
});

// Response: 
// {
//   signature: '0x...',
//   message: 'Authenticate with RenVault',
//   messageHash: '0x...',
//   recoveryId: 0,
//   timestamp: 1234567890,
// }
```

**Features:**
- Ethereum standard message hashing
- Signature recovery
- Batch message signing
- History tracking

### 4. Hardware Wallet Integration

Ledger, Trezor, and KeepKey support with device confirmation flow.

**Usage:**
```typescript
const response = await walletKitSigningService.signWithHardware({
  id: 'hw-tx-1',
  type: 'transaction',
  data: '0x...',
  chainId: 'stacks:1',
  hardware: {
    type: 'ledger',
    derivationPath: "m/44'/60'/0'/0/0",
    confirmationRequired: true,
    displayOnDevice: true,
    timeoutMs: 60000,
  },
});

// Response:
// {
//   signature: '0x...',
//   hardwareDeviceId: 'ledger-device-1',
//   userConfirmed: true,
//   confirmationTime: 1234567890,
// }
```

**Supported wallets:**
- Ledger (via @ledgerhq/hw-transport)
- Trezor (via @trezor/connect)
- KeepKey (community support)

### 5. Multi-Signature Coordination

Manage multi-signature transaction workflows with signer tracking.

**Usage:**
```typescript
// Initiate multi-sig
const response = await walletKitSigningService.initiateMultiSig({
  transaction: { id: 'tx-1', data: '0x...' },
  requiredSignatures: 2,
  signers: ['0xsigner1', '0xsigner2', '0xsigner3'],
  chainId: 'stacks:1',
  timeoutMs: 3600000, // 1 hour
  metadata: { walletAddress: '0xmultisig', nonce: 5 },
});

// Add signatures from signers
await walletKitSigningService.addMultiSigSignature(
  'tx-1',
  '0xsigner1',
  { signature: '0x...', timestamp: 1234567890 }
);

await walletKitSigningService.addMultiSigSignature(
  'tx-1',
  '0xsigner2',
  { signature: '0x...', timestamp: 1234567891 }
);

// Response after threshold reached:
// {
//   transactionId: 'tx-1',
//   signatures: Map { '0xsigner1' => {...}, '0xsigner2' => {...} },
//   isComplete: true,
//   requiredSignatures: 2,
//   currentSignatures: 2,
//   remainingSigners: [],
//   expiresAt: 1704105200,
// }
```

**Features:**
- Configurable signature threshold
- Session expiration
- Signer tracking
- Signature aggregation

### 6. Signature Verification

Verify and recover addresses from signatures.

**Usage:**
```typescript
const response = await walletKitSigningService.verifySignature({
  message: 'Authenticate with RenVault',
  signature: '0x...',
  publicKey: '0x...',
  algorithm: 'ECDSA',
  messageFormat: 'raw',
});

// Response:
// {
//   isValid: true,
//   recoveredAddress: '0x...',
//   verifiedAt: 1234567890,
// }
```

**Supported algorithms:**
- ECDSA (secp256k1)
- EdDSA
- BLS

### 7. Transaction Simulation

Simulate transactions before signing to detect issues.

**Usage:**
```typescript
import { transactionSimulationService } from '@/services/signing/transaction-simulation';

const simulation = await transactionSimulationService.simulateTransaction({
  id: 'tx-1',
  data: '0x...',
  metadata: { from: '0x...', to: '0x...', value: '1000' },
});

// Response:
// {
//   transactionId: 'tx-1',
//   success: true,
//   gasEstimate: '150000',
//   gasUsed: '125430',
//   warnings: [],
//   simulationResult: {
//     status: 'success',
//     gasUsed: 125430,
//     logs: ['Transfer(...)'],
//   },
// }
```

**Features:**
- Gas estimation (calldata + execution)
- Revert detection
- Warning generation
- Caching for repeated simulations

### 8. Error Handling & Recovery

Comprehensive error handling with automatic retry logic.

**Usage:**
```typescript
import { signingErrorHandler } from '@/services/signing/signing-error-handler';

try {
  // Attempt signing
} catch (error) {
  const handledError = signingErrorHandler.handleSigningError(error, {
    requestId: 'req-123',
    transactionId: 'tx-1',
    chainId: 'stacks:1',
    account: '0x...',
    operation: 'batch_sign',
  });

  // Check if retryable
  if (signingErrorHandler.isRetryable(handledError, 'req-123')) {
    const delay = signingErrorHandler.getRetryDelay('req-123');
    signingErrorHandler.recordRetryAttempt('req-123');
    // Retry after delay
  }
}
```

**Error types and recovery:**

| Error | Retryable | Max Retries | Strategy |
|-------|-----------|-------------|----------|
| user_rejected | No | 0 | User action required |
| network_error | Yes | 3 | Exponential backoff (1s, 2s, 4s) |
| timeout | Yes | 2 | Exponential backoff (2s, 3s) |
| hardware_error | Yes | 2 | Linear backoff (3s, 3s) |
| insufficient_funds | No | 0 | Add funds required |
| nonce_conflict | Yes | 1 | Retry with updated nonce |
| gas_estimation_failed | Yes | 2 | Retry with custom gas |
| simulation_failed | No | 0 | Review transaction |

## Component Integration

### React Hooks

```typescript
import { useTransactionSigner } from '@/hooks/useTransactionSigner';

function SignTransactionsForm() {
  const {
    isSigning,
    progress,
    statusMessage,
    sign,
    cancel,
  } = useTransactionSigner({ chainId: 'stacks:1', topic: 'wc_...' });

  return (
    <>
      <button onClick={() => sign(transactions)}>Sign Batch</button>
      {isSigning && (
        <div>
          <div style={{ width: `${progress}%` }} />
          <p>{statusMessage}</p>
          <button onClick={cancel}>Cancel</button>
        </div>
      )}
    </>
  );
}
```

### Enhanced TransactionSigner Component

Updated `TransactionSigner.tsx` to support:
- Batch signing
- Progress indicators
- Error display
- Retry UI

## Configuration

### Environment Variables

```env
# Signing Configuration
VITE_SIGNING_ENABLED=true
VITE_BATCH_SIGNING_ENABLED=true
VITE_EIP712_ENABLED=true
VITE_HARDWARE_WALLET_ENABLED=true
VITE_MULTISIG_ENABLED=true

# Simulation
VITE_SIMULATE_BEFORE_SIGNING=true

# Error Handling
VITE_MAX_SIGNING_RETRIES=3
VITE_SIGNING_TIMEOUT_MS=60000
```

### Thresholds & Limits

- **Batch size**: Max 100 transactions per batch
- **Timeout**: 60 seconds default, configurable per request
- **Retry attempts**: 1-3 depending on error type
- **Cache expiry**: 5 minutes for signatures
- **History size**: 10,000 entries max

## Testing

### Unit Tests
```bash
npm test -- --testPathPattern="signing"
```

### Integration Tests
```bash
npm test -- --testPathPattern="signing.integration"
```

### Test Coverage
- Batch signing (10 tests)
- EIP-712 (8 tests)
- Message signing (7 tests)
- Hardware wallet (6 tests)
- Multi-sig (8 tests)
- Error handling (9 tests)
- Simulation (6 tests)
- Verification (7 tests)

## Performance Considerations

### Caching

- Signatures cached for 5 minutes
- Simulations cached by tx data hash
- EIP-712 computations memoized

### Optimization

- Batch operations reduce round trips
- Parallel simulation for multiple transactions
- Lazy loading of hardware wallet libraries
- Service worker offloading for heavy computation

## Security

### Best Practices

1. **Always validate user input** before signing
2. **Display clear signing context** to user
3. **Use simulation** before signing in production
4. **Verify domain separators** for EIP-712
5. **Implement rate limiting** on signing endpoints
6. **Log all signing activities** for audit trail
7. **Clear sensitive data** after use

### Privacy

- No sensitive data logged (signatures excluded)
- Local-only storage for session data
- GDPR-compliant data retention (30 days max)
- User consent for analytics on signing

## Troubleshooting

### Common Issues

**"User rejected signing"**
- User cancelled the request
- Action: Retry or request again

**"Network error"**
- Transient connectivity issue
- Action: Automatic retry with exponential backoff

**"Hardware wallet error"**
- Device disconnected or unresponsive
- Action: Check device, reconnect, retry

**"Insufficient balance"**
- Wallet doesn't have enough funds
- Action: Add funds and retry

**"Gas estimation failed"**
- Complex contract or simulation timeout
- Action: Provide custom gas limit and retry

## API Reference

### `WalletKitService`

```typescript
// Initialize
const service = await WalletKitService.init();

// Batch signing
service.signTransactions(request: BatchSigningRequest)

// Typed data
service.signTypedData(request: TypedDataSigningRequest)

// Messages
service.signMessage(request: MessageSigningRequest)

// Hardware
service.signWithHardware(request: HardwareSigningRequest)

// Verification
service.verifySignature(request: SignatureVerificationRequest)

// Multi-sig
service.initiateMultiSig(request: MultiSigSigningRequest)
service.addMultiSigSignature(txId, signer, signature)

// Modal
service.openModal()
service.closeModal()
```

## Future Enhancements

- [ ] Batch signing progress visualization
- [ ] Hardware wallet detection & auto-connect
- [ ] EIP-191 message signing variants
- [ ] Schnorr signatures for Bitcoin
- [ ] ZK-proof signing support
- [ ] Smart contract wallet support
- [ ] Session persistence across reloads
- [ ] Signing analytics dashboard

## References

- [EIP-712: Typed Structured Data Hashing](https://eips.ethereum.org/EIPS/eip-712)
- [EIP-191: Signed Data Standard](https://eips.ethereum.org/EIPS/eip-191)
- [WalletConnect Sign API v2](https://docs.walletconnect.com/2.0/sign/)
- [Ledger JavaScript SDK](https://github.com/LedgerHQ/ledgerjs)
- [Trezor Connect](https://github.com/trezor/connect)

## Support & Contributing

For issues or feature requests:
1. Check existing GitHub issues
2. Review this documentation
3. Enable debug logging: `localStorage.setItem('DEBUG', '*')`
4. Create detailed issue with error logs and steps to reproduce
