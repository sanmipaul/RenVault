# Multi-Chain Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies

```bash
npm install @reown/appkit @reown/appkit-adapter-ethereum wagmi viem
```

### 2. Set Environment Variables

Create `.env.local`:

```env
VITE_REOWN_PROJECT_ID=your_project_id_from_reown
VITE_APP_NAME=RenVault
VITE_APP_URL=https://renvault.app
```

### 3. Initialize Services in App.tsx

```typescript
import { initializeAppKitMultiChain } from './services/chain/AppKitMultiChainIntegration';
import { ChainSwitchService } from './services/chain/ChainSwitchService';
import { MultiChainTransactionService } from './services/chain/MultiChainTransactionService';

async function initializeApp() {
  await ChainSwitchService.initialize();
  MultiChainTransactionService.initialize();

  await initializeAppKitMultiChain({
    projectId: import.meta.env.VITE_REOWN_PROJECT_ID,
    appName: import.meta.env.VITE_APP_NAME,
    appUrl: import.meta.env.VITE_APP_URL,
  });
}

initializeApp();
```

### 4. Use Components

```typescript
import { ChainSelector } from './components/chain/ChainSelector';
import { MultiChainBalanceDisplay } from './components/chain/MultiChainBalanceDisplay';
import { useMultiChainWallet } from './services/chain/MultiChainWalletProviderService';

export function App() {
  const { address, isConnected } = useMultiChainWallet();

  return (
    <div>
      <ChainSelector />
      {isConnected && <MultiChainBalanceDisplay address={address} />}
    </div>
  );
}
```

## Common Tasks

### Switch Chains

```typescript
import { useChainSwitch } from './services/chain/ChainSwitchService';

function ChainSwitcher() {
  const { switchChain } = useChainSwitch();

  return (
    <button onClick={() => switchChain('polygon')}>
      Switch to Polygon
    </button>
  );
}
```

### Display Balances

```typescript
import { useMultiChainBalance } from './services/chain/MultiChainBalanceService';

function BalanceDisplay({ address }: { address: string }) {
  const { balances, loading } = useMultiChainBalance(address);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <p>ETH: {balances?.ethereum?.displayBalance}</p>
      <p>MATIC: {balances?.polygon?.displayBalance}</p>
    </div>
  );
}
```

### Validate Address

```typescript
import { NetworkValidationService } from './services/chain/NetworkValidationService';

const result = NetworkValidationService.validateAddress(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE0',
  'ethereum'
);

if (result.isValid) {
  console.log('Valid:', result.normalizedAddress);
} else {
  console.error('Invalid:', result.error);
}
```

### Track Transactions

```typescript
import { MultiChainTransactionService } from './services/chain/MultiChainTransactionService';

// Create transaction
const tx = MultiChainTransactionService.createTransaction({
  chainType: 'ethereum',
  type: 'transfer',
  from: '0x123...',
  to: '0x456...',
  amount: '1.5',
  currency: 'ETH',
  status: 'pending',
});

// Update status
MultiChainTransactionService.updateTransactionStatus(tx.id, 'confirmed');

// Get stats
const stats = MultiChainTransactionService.getStatistics();
console.log('Total:', stats.totalTransactions);
```

## Supported Chains

- **Stacks**: SP2... (mainnet), ST2... (testnet)
- **Ethereum**: 0x... addresses
- **Polygon**: 0x... addresses
- **Arbitrum**: 0x... addresses
- **Sepolia**: 0x... addresses (testnet)

## Key Features

✅ Multi-chain wallet connection  
✅ Real-time balance updates  
✅ Transaction tracking & history  
✅ Address validation  
✅ Chain switching  
✅ Error handling & recovery  
✅ WCAG 2.1 compliant UI  
✅ localStorage persistence  
✅ TypeScript support  

## Troubleshooting

### Wallet Not Connecting?
1. Install MetaMask or Leather
2. Check browser extension is enabled
3. Try refreshing page

### Balance Not Loading?
1. Check RPC endpoints are reachable
2. Verify wallet is connected
3. Click refresh button

### Transaction Not Appearing?
1. Check transaction hash on explorer
2. Verify correct chain selected
3. Clear browser cache

## Documentation

- [MULTI_CHAIN_DOCUMENTATION.md](./MULTI_CHAIN_DOCUMENTATION.md) - Full API reference
- [MULTI_CHAIN_CONFIG_REFERENCE.md](./MULTI_CHAIN_CONFIG_REFERENCE.md) - Configuration guide
- [Examples](./src/examples/MultiChainIntegrationExamples.tsx) - Code examples

## Next Steps

1. ✓ Set up environment variables
2. ✓ Initialize services
3. ✓ Add UI components
4. → Read full documentation
5. → Explore examples
6. → Deploy to production

## Support

- Check documentation
- Review test suite
- Examine examples
- Check RPC status
- Contact team

---

Ready to build? Start with the examples and refer to the full documentation as needed!
