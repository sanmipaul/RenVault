# Wallet Services Documentation

Advanced wallet connection features for RenVault.

## Services

### WalletSessionManager
Manages persistent wallet sessions with local storage.

```typescript
import { sessionManager } from './services';

sessionManager.saveSession(address, data);
const session = sessionManager.getSession(address);
```

### WalletAutoReconnect
Automatic reconnection with retry logic.

```typescript
import { autoReconnect } from './services';

await autoReconnect.attemptReconnect('hiro', address);
```

### WalletAnalytics
Track wallet connections and usage.

```typescript
import { walletAnalytics } from './services';

walletAnalytics.trackConnection('hiro', true, 1000);
const stats = walletAnalytics.getConnectionStats();
```

### NetworkDetector
Detect and switch between networks.

```typescript
import { networkDetector } from './services';

const network = networkDetector.detectNetwork();
networkDetector.switchNetwork('testnet');
```

### ConnectionQueue
Manage multiple connection requests.

```typescript
import { connectionQueue } from './services';

await connectionQueue.add(() => connectWallet());
```

### WalletErrorHandler
Handle and retry wallet errors.

```typescript
import { errorHandler } from './services';

const message = errorHandler.handleError(error, 'connection');
const shouldRetry = errorHandler.shouldRetry(error);
```

### WalletStateManager
Manage wallet connection states.

```typescript
import { walletState } from './services';

walletState.setState('connected');
walletState.onStateChange((state) => console.log(state));
```

### WalletPreferenceManager
User preferences and settings.

```typescript
import { preferenceManager } from './services';

preferenceManager.setDefaultWallet('hiro');
const prefs = preferenceManager.getPreferences();
```

### ConnectionMonitor
Health checks for wallet connections.

```typescript
import { connectionMonitor } from './services';

connectionMonitor.startMonitoring(30000);
const status = connectionMonitor.getHealthStatus();
```

### WalletCacheManager
Cache wallet data for performance.

```typescript
import { walletCache } from './services';

walletCache.set('balance', data, 60000);
const cached = walletCache.get('balance');
```

### WalletEventEmitter
Custom wallet events.

```typescript
import { walletEvents } from './services';

walletEvents.on('connected', (data) => console.log(data));
walletEvents.emit('connected', { address });
```

### WalletSecurityValidator
Validate connections and transactions.

```typescript
import { securityValidator } from './services';

const valid = securityValidator.validateConnection(address, origin);
const result = securityValidator.validateTransaction(tx);
```

## Usage Example

```typescript
import {
  sessionManager,
  walletState,
  walletEvents,
  preferenceManager
} from './services';

// Initialize
preferenceManager.loadPreferences();
sessionManager.loadFromStorage();

// Connect wallet
walletState.setState('connecting');
walletEvents.emit('connecting');

// On success
sessionManager.saveSession(address, { wallet: 'hiro' });
walletState.setState('connected', { address });
walletEvents.emit('connected', { address });
```
