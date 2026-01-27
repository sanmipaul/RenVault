# AppKit Multi-Chain Support Documentation

## Overview

This documentation covers RenVault's comprehensive multi-chain support implementation using AppKit. The system enables seamless interaction with both Stacks and EVM-based blockchains (Ethereum, Polygon, Arbitrum, and Sepolia Testnet).

## Supported Chains

### Layer 1 & L2 Networks

#### Stacks
- **Mainnet**: STX native token, 6 decimal places
- **Testnet**: STX native token for testing
- **Explorer**: https://explorer.stacks.co
- **Chain ID**: Stacks-specific (not EVM)

#### Ethereum
- **Network**: Mainnet
- **Native Token**: ETH (18 decimals)
- **Chain ID**: 1
- **Explorer**: https://etherscan.io

#### Polygon
- **Network**: Mainnet
- **Native Token**: MATIC (18 decimals)
- **Chain ID**: 137
- **Explorer**: https://polygonscan.com

#### Arbitrum
- **Network**: One (L2)
- **Native Token**: ETH (18 decimals)
- **Chain ID**: 42161
- **Explorer**: https://arbiscan.io

#### Sepolia
- **Network**: Testnet
- **Native Token**: SepoliaETH (18 decimals)
- **Chain ID**: 11155111
- **Explorer**: https://sepolia.etherscan.io

## Architecture

### Service Layer

The multi-chain implementation uses a service-based architecture with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│         UI Components Layer             │
│ ChainSelector, MultiChainBalanceDisplay │
│       TransactionStatus, etc.           │
└──────────────────────┬──────────────────┘
                       │
┌──────────────────────▼──────────────────┐
│      Integration Services Layer        │
│ AppKitMultiChainIntegration            │
│ MultiChainWalletProviderService        │
└──────────────────────┬──────────────────┘
                       │
┌──────────────────────▼──────────────────┐
│        Core Services Layer             │
│ ChainSwitchService                     │
│ MultiChainTransactionService           │
│ MultiChainBalanceService               │
│ NetworkValidationService               │
└──────────────────────┬──────────────────┘
                       │
┌──────────────────────▼──────────────────┐
│         Adapter Layer                  │
│ ChainAdapter (Interface)               │
│ EvmChainAdapter                        │
│ StacksChainAdapter                     │
└──────────────────────┬──────────────────┘
                       │
┌──────────────────────▼──────────────────┐
│      Configuration Layer               │
│ multi-chain-config.ts                  │
└─────────────────────────────────────────┘
```

## Core Services

### 1. ChainSwitchService

Manages the active blockchain chain and provides utilities for switching between chains.

**Key Methods:**
- `initialize()`: Initialize service with default chain
- `getActiveChain()`: Get currently active chain
- `switchChain(chainType)`: Switch to specified chain
- `getHistory()`: Get chain switching history (max 20 entries)
- `onChainSwitch(callback)`: Subscribe to chain changes
- `isStacksActive()` / `isEvmActive()`: Check active chain type

**Features:**
- localStorage persistence (key: `renvault_active_chain`)
- Chain history tracking
- Listener pattern for reactive updates
- Automatic adapter retrieval

**Example Usage:**
```typescript
import { ChainSwitchService } from './services/chain/ChainSwitchService';

// Initialize
await ChainSwitchService.initialize();

// Switch chains
await ChainSwitchService.switchChain('polygon');

// Get active chain
const chain = ChainSwitchService.getActiveChain();
console.log(chain.type); // 'polygon'

// Subscribe to changes
const unsubscribe = ChainSwitchService.onChainSwitch((chain) => {
  console.log('Switched to:', chain.type);
});

// Cleanup
unsubscribe();
```

### 2. MultiChainTransactionService

Manages transactions across all supported chains with filtering, statistics, and persistence.

**Key Methods:**
- `createTransaction(tx)`: Create new transaction record
- `updateTransactionStatus(id, status)`: Update transaction status
- `getTransaction(id)`: Get single transaction
- `getTransactionsByChain(chainType)`: Filter by chain
- `getTransactionsByAddress(address)`: Filter by wallet address
- `getStatistics()`: Get transaction analytics

**Features:**
- Cross-chain transaction tracking
- Status filtering (pending, confirmed, failed)
- localStorage persistence (max 100 transactions)
- Transaction statistics and analytics
- Export/import functionality

**Transaction Object:**
```typescript
interface Transaction {
  id: string;
  chainType: ChainType;
  type: 'transfer' | 'swap';
  from: string;
  to: string;
  amount: string;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed';
  hash?: string;
  timestamp: number;
  gasUsed?: string;
  gasPrice?: string;
  blockNumber?: number;
  fee?: string;
}
```

**Example Usage:**
```typescript
import { MultiChainTransactionService } from './services/chain/MultiChainTransactionService';

MultiChainTransactionService.initialize();

// Create transaction
const tx = MultiChainTransactionService.createTransaction({
  chainType: 'ethereum',
  type: 'transfer',
  from: '0x123...',
  to: '0x456...',
  amount: '1.5',
  currency: 'ETH',
  status: 'pending'
});

// Update status
MultiChainTransactionService.updateTransactionStatus(tx.id, 'confirmed');

// Get stats
const stats = MultiChainTransactionService.getStatistics();
console.log(stats.totalTransactions);
```

### 3. MultiChainBalanceService

Fetches and caches balances across all chains with monitoring capabilities.

**Key Methods:**
- `getBalance(chainType, address)`: Get balance for specific chain
- `getMultiChainBalance(address)`: Get balances across all chains
- `startMonitoring(address)`: Auto-refresh balances every 30 seconds
- `stopMonitoring(address)`: Stop monitoring address
- `onBalanceUpdate(callback)`: Subscribe to balance updates

**Features:**
- RPC-based balance queries for EVM chains
- 30-second auto-refresh polling
- Multi-chain balance aggregation
- Caching with timestamp tracking
- Listener pattern for updates

**React Hook:**
```typescript
const { balances, loading, error, refetch } = useMultiChainBalance(address);
```

**Example Usage:**
```typescript
import { useMultiChainBalance } from './services/chain/MultiChainBalanceService';

function BalanceComponent({ address }) {
  const { balances, loading, refetch } = useMultiChainBalance(address);

  return (
    <div>
      {balances && (
        <>
          <p>ETH: {balances.ethereum?.displayBalance}</p>
          <p>MATIC: {balances.polygon?.displayBalance}</p>
          <button onClick={refetch}>Refresh</button>
        </>
      )}
    </div>
  );
}
```

### 4. NetworkValidationService

Validates addresses, transactions, and chain operations.

**Key Methods:**
- `validateAddress(address, chainType)`: Validate single address
- `validateAmount(amount, chainType)`: Validate transaction amount
- `validateTransaction(tx)`: Complete transaction validation
- `isChainReachable(chainType)`: Test RPC connectivity
- `isOperationSupported(operation, chainType)`: Check feature support
- `validateChainSwitch(from, to)`: Validate chain switch feasibility

**Example Usage:**
```typescript
import { NetworkValidationService } from './services/chain/NetworkValidationService';

// Validate Ethereum address
const result = NetworkValidationService.validateAddress(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE0',
  'ethereum'
);

if (result.isValid) {
  console.log('Valid address:', result.normalizedAddress);
}

// Validate complete transaction
const txValidation = NetworkValidationService.validateTransaction({
  from: '0x123...',
  to: '0x456...',
  amount: '1.5',
  chainType: 'ethereum'
});

if (!txValidation.isValid) {
  console.error(txValidation.error);
}
```

### 5. MultiChainWalletProviderService

Integrates wallet providers (MetaMask, Leather, etc.) for multi-chain connectivity.

**Key Methods:**
- `initialize()`: Detect and register available wallets
- `connectWallet(providerName)`: Connect to wallet
- `disconnectWallet()`: Disconnect current wallet
- `getAvailableProviders()`: List detected wallets
- `getCurrentWallet()`: Get current connection state
- `onWalletChange(callback)`: Subscribe to wallet changes

**React Hook:**
```typescript
const {
  wallet,
  providers,
  loading,
  connectWallet,
  disconnectWallet,
  isConnected
} = useMultiChainWallet();
```

## Adapter Layer

### ChainAdapter Interface

All chain-specific implementations follow the `ChainAdapter` interface:

```typescript
interface ChainAdapter {
  getChainId(): string;
  getChainNamespace(): string;
  getNetwork(): any;
  isTestnet(): boolean;
  getMetadata(): ChainMetadata;
  getRpcUrl(): string;
  getExplorerUrl(): string;
  getNativeToken(): Token;
  isValidAddress(address: string): boolean;
  formatAddress(address: string): string;
}
```

### EvmChainAdapter

Implements EVM chain operations (Ethereum, Polygon, Arbitrum, Sepolia).

**EVM-Specific Methods:**
- `toWei(amount: string)`: Convert to Wei
- `fromWei(wei: BigInt)`: Convert from Wei
- `getGasPrice()`: Fetch current gas price
- `estimateGas(tx)`: Estimate transaction gas
- `getBalance(address)`: Query account balance

**Example:**
```typescript
import { EvmChainAdapter } from './services/chain/EvmChainAdapter';

const adapter = EvmChainAdapter.createEthereumAdapter();

// Amount conversion
const wei = adapter.toWei('1.5'); // ETH to Wei
const eth = adapter.fromWei(wei); // Wei to ETH

// Address validation
if (adapter.isValidAddress('0x742d...')) {
  console.log('Valid address');
}

// Format with checksum
const formatted = adapter.formatAddress('0x742d...');
```

### StacksChainAdapter

Implements Stacks-specific operations.

**Stacks-Specific Methods:**
- `toSmallestUnit(amount)`: Convert STX to microSTX
- `fromSmallestUnit(microStx)`: Convert microSTX to STX

**Address Validation:**
- Supports: `SP2...` (mainnet), `ST2...` (testnet)
- Pattern validation with regex

**Example:**
```typescript
import { StacksChainAdapter } from './services/chain/StacksChainAdapter';

const adapter = StacksChainAdapter.createStacksMainnetAdapter();

// Amount conversion
const microStx = adapter.toSmallestUnit('1.5');
const stx = adapter.fromSmallestUnit(microStx);

// Address validation
if (adapter.isValidAddress('SP2JXKMH2R6S7...')) {
  console.log('Valid Stacks address');
}
```

## UI Components

### 1. ChainSelector Component

Dropdown component for switching between chains with visual indicators.

**Props:**
```typescript
interface ChainSelectorProps {
  onChainChange?: (chainType: ChainType) => void;
  compact?: boolean;
  className?: string;
}
```

**Features:**
- Grouped chain display (Layer 1, EVM, Testnets)
- Visual chain indicators with colors
- Testnet badges
- Active chain highlighting
- Smooth animations

**Usage:**
```typescript
import { ChainSelector } from './components/chain/ChainSelector';

<ChainSelector
  onChainChange={(chain) => console.log('Switched to:', chain)}
  compact={false}
/>
```

### 2. MultiChainBalanceDisplay Component

Shows balances across all chains with refresh capability.

**Props:**
```typescript
interface BalanceDisplayProps {
  address?: string;
  showAllChains?: boolean;
  compact?: boolean;
  className?: string;
  onRefresh?: () => void;
}
```

**Features:**
- Multi-chain balance grid
- Per-chain balance cards
- Total balance aggregation
- Manual refresh button
- Auto-polling (5 seconds)
- Responsive design

**Usage:**
```typescript
import { MultiChainBalanceDisplay } from './components/chain/MultiChainBalanceDisplay';

<MultiChainBalanceDisplay
  address={userAddress}
  showAllChains={true}
  onRefresh={() => console.log('Refreshing...')}
/>
```

### 3. TransactionStatus Component

Displays transaction history with chain-specific explorer links.

**Props:**
```typescript
interface TransactionStatusProps {
  address?: string;
  showAll?: boolean;
  className?: string;
  maxTransactions?: number;
}
```

**Features:**
- Transaction filtering (pending, confirmed, failed)
- Chain-specific explorer links
- Relative timestamps
- Status color coding
- Responsive layout
- Transaction count badges

**Usage:**
```typescript
import { TransactionStatus } from './components/chain/TransactionStatus';

<TransactionStatus
  address={userAddress}
  maxTransactions={10}
/>
```

## AppKit Integration

### Initialization

```typescript
import { initializeAppKitMultiChain } from './services/chain/AppKitMultiChainIntegration';

// Initialize with configuration
await initializeAppKitMultiChain({
  projectId: 'YOUR_REOWN_PROJECT_ID',
  appName: 'RenVault',
  appUrl: 'https://renvault.app',
  appIcon: 'https://renvault.app/logo.png',
  defaultChain: 'ethereum'
});
```

### Helper Functions

```typescript
import {
  getAppKit,
  getConnectedAddress,
  getConnectedChain,
  switchChainViaAppKit,
  sendTransactionViaAppKit,
  isWalletConnected
} from './services/chain/AppKitMultiChainIntegration';

// Check connection
if (isWalletConnected()) {
  const address = getConnectedAddress();
  const chain = getConnectedChain();
  console.log(`Connected: ${address} on ${chain}`);
}

// Send transaction
const hash = await sendTransactionViaAppKit({
  to: '0x456...',
  from: '0x123...',
  value: '1000000000000000000', // 1 ETH in Wei
  data: '0x'
});
```

## React Hooks

### useChainSwitch

```typescript
const {
  activeChain,
  switchChain,
  isStacks,
  isEvm,
  adapter,
  allChains,
  history
} = useChainSwitch();
```

### useMultiChainBalance

```typescript
const {
  balances,
  loading,
  error,
  refetch
} = useMultiChainBalance(address);
```

### useMultiChainTransactions

```typescript
const {
  transactions,
  loading,
  error,
  refetch,
  getByChain,
  getByStatus,
  statistics
} = useMultiChainTransactions(address);
```

### useMultiChainWallet

```typescript
const {
  wallet,
  providers,
  loading,
  error,
  connectWallet,
  disconnectWallet,
  isConnected,
  address,
  chainType
} = useMultiChainWallet();
```

## Data Persistence

### localStorage Keys

- `renvault_active_chain`: Current active chain (ChainType)
- `renvault_chain_switch_history`: Chain switching history
- `renvault_transactions`: Transaction history
- `renvault_wallet_state`: Current wallet connection state

### Data Structure Examples

```typescript
// Active Chain
localStorage['renvault_active_chain'] = 'ethereum'

// Chain History
localStorage['renvault_chain_switch_history'] = JSON.stringify([
  { type: 'ethereum', timestamp: 1234567890 },
  { type: 'polygon', timestamp: 1234567891 }
])

// Transactions (max 100)
localStorage['renvault_transactions'] = JSON.stringify([
  {
    id: 'tx_uuid',
    chainType: 'ethereum',
    type: 'transfer',
    from: '0x...',
    to: '0x...',
    amount: '1.5',
    currency: 'ETH',
    status: 'confirmed',
    hash: '0x...',
    timestamp: 1234567890
  }
])
```

## Error Handling

### Common Error Scenarios

```typescript
try {
  // Chain validation
  const validation = NetworkValidationService.validateAddress(address, chainType);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Chain reachability
  const reachable = await NetworkValidationService.isChainReachable(chainType);
  if (!reachable.isValid) {
    throw new Error('Chain not reachable');
  }

  // Transaction execution
  const hash = await sendTransactionViaAppKit(txData);
} catch (error) {
  console.error('Multi-chain operation failed:', error);
  // Provide user-friendly error message
}
```

### Retry Logic

```typescript
async function retryChainOperation(fn: () => Promise<any>, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  throw lastError;
}
```

## Testing

Run the comprehensive test suite:

```bash
npm test -- MultiChainServices.test.ts
```

**Test Coverage:**
- Chain switching and persistence
- Transaction creation and tracking
- Address and amount validation
- Adapter chain-specific operations
- Multi-chain integration scenarios
- Error handling

## Performance Considerations

### Balance Polling

- Default: 30-second interval
- Configurable via `UPDATE_INTERVAL` constant
- Reduces on blur, increases on focus

### Transaction Caching

- Max 100 transactions stored
- Older transactions automatically pruned
- localStorage size: ~10-15KB typical

### Network Requests

- RPC calls debounced
- Parallel requests for multi-chain operations
- Connection pooling via fetch

## Security Best Practices

1. **Address Validation**: Always validate addresses before operations
2. **Amount Limits**: Warn users for large transactions
3. **Chain Verification**: Verify chain before sending transactions
4. **Wallet Connection**: Validate wallet signatures
5. **Data Privacy**: No private keys stored locally
6. **HTTPS Only**: Enforce HTTPS for all connections

## Troubleshooting

### Chain Switch Issues

```typescript
// Clear cached state
localStorage.removeItem('renvault_active_chain');
ChainSwitchService.clearHistory();

// Re-initialize
await ChainSwitchService.initialize();
```

### Balance Not Loading

```typescript
// Check RPC connectivity
const reachable = await NetworkValidationService.isChainReachable('ethereum');
if (!reachable.isValid) {
  console.error('RPC unreachable:', reachable.error);
}

// Manually refetch
const balances = await MultiChainBalanceService.getMultiChainBalance(address);
```

### Transaction Tracking Issues

```typescript
// Export and reimport transaction history
const exported = MultiChainTransactionService.exportTransactions();
console.log('Transactions:', exported);

// Clear if corrupted
localStorage.removeItem('renvault_transactions');
MultiChainTransactionService.initialize();
```

## API Reference

Complete API documentation available in `/frontend/API_REFERENCE.md`

## Contributing

When adding support for new chains:

1. Extend `multi-chain-config.ts` with new chain configuration
2. Create adapter implementing `ChainAdapter` interface
3. Update `ChainSwitchService` to include new chain
4. Add tests for new chain support
5. Update documentation

## Version History

- **v1.0.0** (Current)
  - Multi-chain support for Stacks, Ethereum, Polygon, Arbitrum, Sepolia
  - AppKit integration
  - Transaction tracking and analytics
  - Balance monitoring
  - Comprehensive validation

## Support

For issues or questions:
1. Check troubleshooting section
2. Review test suite examples
3. Check RPC endpoint status
4. Verify wallet connectivity
5. Clear browser cache/localStorage

---

**Last Updated**: 2024
**Maintainer**: RenVault Team
