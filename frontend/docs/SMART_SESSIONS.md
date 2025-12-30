# Smart Sessions Implementation Guide

## Overview
Smart Sessions enable automated onchain actions within defined parameters, improving UX for recurring operations and reducing transaction fatigue.

## Key Features

### Session Configuration
- **Duration**: Time-bound permissions (1 day to 90 days)
- **Spending Limits**: Cap total spend per session
- **Operation Whitelisting**: Restrict to specific transaction types
- **Contract Whitelisting**: Allow only trusted contract addresses
- **Transaction Limits**: Max transactions per day/hour
- **Batching**: Optional batch transaction support

### Security Measures
- Session encryption with derived keys
- Granular permission controls
- Real-time anomaly detection
- Activity logging and audit trails
- Emergency revocation mechanism
- Expiration enforcement

### Use Cases

#### Recurring Deposits
```typescript
const sessionConfig = {
  duration: 7 * 24 * 60 * 60 * 1000, // 7 days
  spendingLimit: { amount: '700000000', currency: 'STX' }, // 700 STX
  constraints: {
    maxTransactionsPerDay: 1,
    operationWhitelist: [SessionPermission.VAULT_DEPOSIT],
    requiresConfirmation: false,
    allowBatching: false,
  }
};
```

#### Auto-Compounding
```typescript
const sessionConfig = {
  duration: 30 * 24 * 60 * 60 * 1000, // 30 days
  spendingLimit: { amount: '10000000000', currency: 'STX' }, // 10,000 STX
  constraints: {
    maxTransactionsPerDay: 2,
    operationWhitelist: [
      SessionPermission.VAULT_CLAIM_REWARDS,
      SessionPermission.AUTO_COMPOUND
    ],
    requiresConfirmation: false,
    allowBatching: true,
  }
};
```

## API Reference

### SmartSessionService
```typescript
// Create session
const session = smartSessionService.createSession({
  duration: ms,
  spendingLimit,
  constraints,
  walletAddress
});

// Get active sessions
const sessions = smartSessionService.getActiveSessions(walletAddress);

// Revoke session
smartSessionService.revokeSession(sessionId);
```

### SessionPermissionManager
```typescript
// Validate permission
const result = sessionPermissionManager.validatePermission(session, request);

// Check operation allowed
const allowed = sessionPermissionManager.isOperationAllowed(session, operation);
```

### SessionActivityLogger
```typescript
// Log activity
sessionActivityLogger.logActivity(log);

// Detect anomalies
const alerts = sessionActivityLogger.detectAnomalies(session);
```

## Components

### SmartSessionConfig
UI component for creating new sessions with visual configuration.

### SessionMonitor
User-facing component to view and manage their active sessions.

### AdminSessionDashboard
Admin interface for monitoring all sessions and anomalies.

## Analytics Integration

Smart Session events are tracked automatically:
- Session creation
- Session revocation
- Automated transactions
- Anomaly detection
- Permission validations

## Security Considerations

1. **Conservative Defaults**
   - Low spending limits by default
   - Short session durations
   - Manual confirmation encouraged

2. **Anomaly Detection**
   - Rate limit monitoring
   - Unusual amount detection
   - Unknown contract detection

3. **User Education**
   - Clear session status indicators
   - Transaction previews
   - Risk disclaimers

4. **Emergency Controls**
   - One-click session revocation
   - Admin emergency revocation
   - Automatic expiration

## Storage
Sessions are encrypted and stored in localStorage with compression support. Encryption keys are derived from wallet address and session ID.

## Backwards Compatibility
Full backwards compatibility with existing session management. Smart Sessions are opt-in features.
