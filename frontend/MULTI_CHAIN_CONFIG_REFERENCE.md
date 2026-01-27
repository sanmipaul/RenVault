/**
 * Multi-Chain Configuration Reference
 * Complete reference for configuring multi-chain support
 */

# Multi-Chain Configuration Reference

## Environment Setup

### Required Environment Variables

```bash
# AppKit Configuration
VITE_REOWN_PROJECT_ID=your_reown_project_id_here

# RPC Endpoints (Optional - uses defaults if not provided)
VITE_ETHEREUM_RPC_URL=https://eth.llamarpc.com
VITE_POLYGON_RPC_URL=https://polygon-rpc.com
VITE_ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
VITE_SEPOLIA_RPC_URL=https://1rpc.io/sepolia

# API Configuration
VITE_API_BASE_URL=https://api.renvault.app
VITE_APP_NAME=RenVault
VITE_APP_URL=https://renvault.app
VITE_APP_ICON=https://renvault.app/logo.png
```

### Configuration File Setup

Create `.env.local` in your project root:

```env
VITE_REOWN_PROJECT_ID=abc123def456ghi789jkl
VITE_APP_NAME=RenVault
VITE_APP_URL=https://renvault.app
```

## Chain Configuration

### Stacks Configuration

```typescript
// Default configuration
const stacksMainnet = {
  type: 'stacks' as const,
  name: 'Stacks',
  chainId: 'stacks-mainnet',
  namespace: 'stacks',
  network: {
    id: 'mainnet',
    name: 'Mainnet',
    rpcUrl: 'https://api.hiro.so', // Hiro Node API
  },
  nativeCurrency: {
    name: 'Stacks',
    symbol: 'STX',
    decimals: 6,
  },
  explorers: [
    {
      name: 'Stacks Explorer',
      url: 'https://explorer.stacks.co',
    },
  ],
  testnet: false,
};

// Testnet configuration
const stacksTestnet = {
  ...stacksMainnet,
  type: 'stacks-testnet' as const,
  network: {
    id: 'testnet',
    name: 'Testnet',
    rpcUrl: 'https://api.testnet.hiro.so',
  },
  explorers: [
    {
      name: 'Testnet Explorer',
      url: 'https://testnet-explorer.stacks.co',
    },
  ],
  testnet: true,
};
```

### EVM Chain Configuration

```typescript
// Ethereum Mainnet
const ethereum = {
  type: 'ethereum' as const,
  name: 'Ethereum',
  chainId: '1',
  namespace: 'evm',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrl: 'https://eth.llamarpc.com',
  explorers: [
    {
      name: 'Etherscan',
      url: 'https://etherscan.io',
    },
  ],
  testnet: false,
};

// Polygon (Matic)
const polygon = {
  type: 'polygon' as const,
  name: 'Polygon',
  chainId: '137',
  namespace: 'evm',
  nativeCurrency: {
    name: 'Matic',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrl: 'https://polygon-rpc.com',
  explorers: [
    {
      name: 'PolygonScan',
      url: 'https://polygonscan.com',
    },
  ],
  testnet: false,
};

// Arbitrum One
const arbitrum = {
  type: 'arbitrum' as const,
  name: 'Arbitrum One',
  chainId: '42161',
  namespace: 'evm',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrl: 'https://arb1.arbitrum.io/rpc',
  explorers: [
    {
      name: 'Arbiscan',
      url: 'https://arbiscan.io',
    },
  ],
  testnet: false,
};

// Sepolia Testnet
const sepolia = {
  type: 'sepolia' as const,
  name: 'Sepolia',
  chainId: '11155111',
  namespace: 'evm',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'SEP',
    decimals: 18,
  },
  rpcUrl: 'https://1rpc.io/sepolia',
  explorers: [
    {
      name: 'Sepolia Etherscan',
      url: 'https://sepolia.etherscan.io',
    },
  ],
  testnet: true,
};
```

## Service Initialization

### ChainSwitchService Initialization

```typescript
import { ChainSwitchService } from './services/chain/ChainSwitchService';

// Initialize with default chain
await ChainSwitchService.initialize();

// Or with custom initial chain
const config = { initialChain: 'polygon' };
await ChainSwitchService.initialize();
```

### AppKit Initialization

```typescript
import { initializeAppKitMultiChain } from './services/chain/AppKitMultiChainIntegration';

const appKitConfig = {
  projectId: import.meta.env.VITE_REOWN_PROJECT_ID,
  appName: import.meta.env.VITE_APP_NAME || 'RenVault',
  appUrl: import.meta.env.VITE_APP_URL || 'https://renvault.app',
  appIcon: import.meta.env.VITE_APP_ICON,
  defaultChain: 'ethereum',
};

await initializeAppKitMultiChain(appKitConfig);
```

### All Services Initialization

```typescript
import { ChainSwitchService } from './services/chain/ChainSwitchService';
import { MultiChainTransactionService } from './services/chain/MultiChainTransactionService';
import { initializeAppKitMultiChain } from './services/chain/AppKitMultiChainIntegration';

export async function initializeMultiChain() {
  try {
    // Initialize core services
    await ChainSwitchService.initialize();
    MultiChainTransactionService.initialize();

    // Initialize AppKit integration
    await initializeAppKitMultiChain({
      projectId: import.meta.env.VITE_REOWN_PROJECT_ID,
      appName: 'RenVault',
      appUrl: 'https://renvault.app',
      defaultChain: 'ethereum',
    });

    console.log('Multi-chain services initialized');
  } catch (error) {
    console.error('Failed to initialize multi-chain services:', error);
    throw error;
  }
}
```

## TypeScript Configuration

### Update tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,

    // Path aliases for cleaner imports
    "baseUrl": ".",
    "paths": {
      "@services/*": ["src/services/*"],
      "@components/*": ["src/components/*"],
      "@config/*": ["src/config/*"],
      "@utils/*": ["src/utils/*"],
      "@hooks/*": ["src/hooks/*"]
    }
  }
}
```

### Using Path Aliases

```typescript
// Instead of
import { ChainSwitchService } from '../../services/chain/ChainSwitchService';

// Use
import { ChainSwitchService } from '@services/chain/ChainSwitchService';
```

## Component Integration

### Add Multi-Chain Components to Main App

```typescript
// App.tsx
import React from 'react';
import { ChainSelector } from '@components/chain/ChainSelector';
import { MultiChainBalanceDisplay } from '@components/chain/MultiChainBalanceDisplay';
import { TransactionStatus } from '@components/chain/TransactionStatus';
import { useMultiChainWallet } from '@services/chain/MultiChainWalletProviderService';

export function App() {
  const { address, isConnected } = useMultiChainWallet();

  return (
    <div className="app">
      <header>
        <h1>RenVault</h1>
        <ChainSelector />
      </header>

      {isConnected ? (
        <main>
          <MultiChainBalanceDisplay address={address} />
          <TransactionStatus address={address} />
        </main>
      ) : (
        <div>Please connect your wallet</div>
      )}
    </div>
  );
}
```

## Storage Configuration

### localStorage Keys

Configure storage persistence for multi-chain data:

```typescript
// localStorage keys used by services
const STORAGE_KEYS = {
  activeChain: 'renvault_active_chain',
  chainHistory: 'renvault_chain_switch_history',
  transactions: 'renvault_transactions',
  walletState: 'renvault_wallet_state',
  balanceCache: 'renvault_balance_cache',
};
```

### Clear Storage

```typescript
function clearMultiChainStorage() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
```

## RPC Configuration

### Custom RPC Endpoints

```typescript
// Override default RPC endpoints
const customRpcConfig = {
  ethereum: 'https://your-eth-rpc.com',
  polygon: 'https://your-polygon-rpc.com',
  arbitrum: 'https://your-arbitrum-rpc.com',
  sepolia: 'https://your-sepolia-rpc.com',
};

// Use in adapter configuration
const adapter = EvmChainAdapter.createEthereumAdapter();
// Adapters use configured RPC URLs automatically
```

### RPC Rate Limiting

```typescript
// Configure rate limiting for RPC calls
const RPC_CONFIG = {
  maxRequestsPerSecond: 10,
  retryAttempts: 3,
  retryDelayMs: 1000,
  timeoutMs: 10000,
};
```

## Feature Flags

### Enable/Disable Features

```typescript
const FEATURE_FLAGS = {
  enableStacks: true,
  enableEthereum: true,
  enablePolygon: true,
  enableArbitrum: true,
  enableSepolia: true,
  enableBridging: false,
  enableSwaps: false,
  enableStaking: false,
};

export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature];
}
```

## Security Configuration

### Wallet Security

```typescript
// Security settings for wallet operations
const WALLET_SECURITY = {
  requireSignatureForTransactions: true,
  maxTransactionAmount: 1000, // USD
  requireConfirmationForLargeTransactions: true,
  largeTransactionThreshold: 500, // USD
  sessionTimeoutMinutes: 30,
};
```

### Rate Limiting

```typescript
// Rate limiting for sensitive operations
const RATE_LIMITS = {
  transactionsPerHour: 10,
  chainSwitchesPerMinute: 5,
  addressValidationsPerSecond: 20,
};
```

## Logging Configuration

### Enable Debug Logging

```typescript
// In development
const DEBUG_CONFIG = {
  logChainSwitches: true,
  logTransactions: true,
  logBalanceUpdates: true,
  logErrors: true,
  logNetworkCalls: true,
};

// Use in services
if (import.meta.env.DEV && DEBUG_CONFIG.logChainSwitches) {
  console.log('Chain switched to:', chainType);
}
```

## Testing Configuration

### Test Environment Variables

```bash
# .env.test
VITE_REOWN_PROJECT_ID=test_project_id
VITE_APP_NAME=RenVault Test
VITE_API_BASE_URL=http://localhost:3000

# Use mock chains for testing
VITE_USE_MOCK_CHAINS=true
```

### Mock Chain Adapter (Testing)

```typescript
export class MockChainAdapter implements ChainAdapter {
  getChainId(): string {
    return 'mock-1';
  }

  getChainNamespace(): string {
    return 'evm';
  }

  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // ... implement other methods
}
```

## Performance Configuration

### Polling Intervals

```typescript
const POLLING_CONFIG = {
  balanceUpdateIntervalMs: 30000, // 30 seconds
  transactionStatusCheckIntervalMs: 5000, // 5 seconds
  gasPrice UpdateIntervalMs: 15000, // 15 seconds
};
```

### Caching Configuration

```typescript
const CACHE_CONFIG = {
  maxCachedBalances: 100,
  maxCachedTransactions: 100,
  balanceCacheTtlMs: 60000, // 1 minute
  addressValidationCacheTtlMs: 300000, // 5 minutes
};
```

## Error Handling Configuration

### Error Recovery Strategies

```typescript
const ERROR_RECOVERY = {
  maxRetryAttempts: 3,
  initialRetryDelayMs: 1000,
  maxRetryDelayMs: 10000,
  exponentialBackoffMultiplier: 2,
};
```

## Browser Support

### Minimum Requirements

```typescript
const BROWSER_REQUIREMENTS = {
  minChromeVersion: 90,
  minFirefoxVersion: 88,
  minSafariVersion: 14,
  minEdgeVersion: 90,
};
```

## Related Documentation

- [MULTI_CHAIN_DOCUMENTATION.md](./MULTI_CHAIN_DOCUMENTATION.md) - Complete API reference
- [API_REFERENCE.md](../API_REFERENCE.md) - Full API documentation
- Environment configuration guide
- Security best practices

---

**Last Updated**: 2024
**Version**: 1.0.0
