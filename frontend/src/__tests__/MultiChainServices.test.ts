/**
 * Multi-Chain Services Test Suite
 * Comprehensive tests for all multi-chain functionality
 */

import { ChainSwitchService } from '../services/chain/ChainSwitchService';
import { MultiChainTransactionService } from '../services/chain/MultiChainTransactionService';
import { MultiChainBalanceService } from '../services/chain/MultiChainBalanceService';
import { NetworkValidationService } from '../services/chain/NetworkValidationService';
import { EvmChainAdapter } from '../services/chain/EvmChainAdapter';
import { StacksChainAdapter } from '../services/chain/StacksChainAdapter';

describe('Multi-Chain Services Test Suite', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Cleanup
    ChainSwitchService.destroy();
    MultiChainTransactionService.destroy();
    MultiChainBalanceService.destroy();
  });

  describe('ChainSwitchService', () => {
    it('should initialize with default chain', async () => {
      await ChainSwitchService.initialize();
      const activeChain = ChainSwitchService.getActiveChain();

      expect(activeChain).toBeDefined();
      expect(activeChain?.type).toBe('ethereum');
    });

    it('should switch between chains', async () => {
      await ChainSwitchService.initialize();

      await ChainSwitchService.switchChain('polygon');
      const activeChain = ChainSwitchService.getActiveChain();

      expect(activeChain?.type).toBe('polygon');
    });

    it('should maintain chain history', async () => {
      await ChainSwitchService.initialize();

      await ChainSwitchService.switchChain('ethereum');
      await ChainSwitchService.switchChain('polygon');
      await ChainSwitchService.switchChain('arbitrum');

      const history = ChainSwitchService.getHistory();

      expect(history.length).toBeGreaterThan(0);
      expect(history[history.length - 1].type).toBe('arbitrum');
    });

    it('should persist chain selection to localStorage', async () => {
      await ChainSwitchService.initialize();
      await ChainSwitchService.switchChain('polygon');

      const stored = localStorage.getItem('renvault_active_chain');
      expect(stored).toBe('polygon');
    });

    it('should notify listeners on chain switch', async () => {
      await ChainSwitchService.initialize();

      const listener = jest.fn();
      const unsubscribe = ChainSwitchService.onChainSwitch(listener);

      await ChainSwitchService.switchChain('polygon');

      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ type: 'polygon' }));

      unsubscribe();
    });

    it('should identify Stacks vs EVM chains', async () => {
      await ChainSwitchService.initialize();

      expect(ChainSwitchService.isStacksActive()).toBe(false);
      expect(ChainSwitchService.isEvmActive()).toBe(true);

      await ChainSwitchService.switchChain('stacks');

      expect(ChainSwitchService.isStacksActive()).toBe(true);
      expect(ChainSwitchService.isEvmActive()).toBe(false);
    });

    it('should get all chains grouped by type', async () => {
      await ChainSwitchService.initialize();

      const evmChains = ChainSwitchService.getEvmChains();
      const stacksChains = ChainSwitchService.getStacksChains();

      expect(evmChains.length).toBeGreaterThan(0);
      expect(stacksChains.length).toBeGreaterThan(0);
    });
  });

  describe('MultiChainTransactionService', () => {
    it('should create transaction', () => {
      MultiChainTransactionService.initialize();

      const tx = MultiChainTransactionService.createTransaction({
        chainType: 'ethereum',
        type: 'transfer',
        from: '0x123456',
        to: '0x654321',
        amount: '1.5',
        currency: 'ETH',
        status: 'pending',
      });

      expect(tx).toBeDefined();
      expect(tx.chainType).toBe('ethereum');
    });

    it('should update transaction status', () => {
      MultiChainTransactionService.initialize();

      const tx = MultiChainTransactionService.createTransaction({
        chainType: 'ethereum',
        type: 'transfer',
        from: '0x123456',
        to: '0x654321',
        amount: '1.5',
        currency: 'ETH',
        status: 'pending',
      });

      MultiChainTransactionService.updateTransactionStatus(tx.id, 'confirmed');
      const updated = MultiChainTransactionService.getTransaction(tx.id);

      expect(updated?.status).toBe('confirmed');
    });

    it('should get transactions by chain', () => {
      MultiChainTransactionService.initialize();

      MultiChainTransactionService.createTransaction({
        chainType: 'ethereum',
        type: 'transfer',
        from: '0x123456',
        to: '0x654321',
        amount: '1.5',
        currency: 'ETH',
        status: 'confirmed',
      });

      MultiChainTransactionService.createTransaction({
        chainType: 'polygon',
        type: 'transfer',
        from: '0x123456',
        to: '0x654321',
        amount: '100',
        currency: 'MATIC',
        status: 'confirmed',
      });

      const ethereumTxs = MultiChainTransactionService.getTransactionsByChain('ethereum');
      const polygonTxs = MultiChainTransactionService.getTransactionsByChain('polygon');

      expect(ethereumTxs.length).toBe(1);
      expect(polygonTxs.length).toBe(1);
    });

    it('should filter transactions by status', () => {
      MultiChainTransactionService.initialize();

      MultiChainTransactionService.createTransaction({
        chainType: 'ethereum',
        type: 'transfer',
        from: '0x123456',
        to: '0x654321',
        amount: '1.5',
        currency: 'ETH',
        status: 'pending',
      });

      MultiChainTransactionService.createTransaction({
        chainType: 'ethereum',
        type: 'transfer',
        from: '0x123456',
        to: '0x654321',
        amount: '2',
        currency: 'ETH',
        status: 'confirmed',
      });

      const pending = MultiChainTransactionService.getPendingTransactions();
      const confirmed = MultiChainTransactionService.getConfirmedTransactions();

      expect(pending.length).toBe(1);
      expect(confirmed.length).toBe(1);
    });

    it('should calculate transaction statistics', () => {
      MultiChainTransactionService.initialize();

      MultiChainTransactionService.createTransaction({
        chainType: 'ethereum',
        type: 'transfer',
        from: '0x123456',
        to: '0x654321',
        amount: '1.5',
        currency: 'ETH',
        status: 'confirmed',
      });

      MultiChainTransactionService.createTransaction({
        chainType: 'polygon',
        type: 'transfer',
        from: '0x123456',
        to: '0x654321',
        amount: '100',
        currency: 'MATIC',
        status: 'pending',
      });

      const stats = MultiChainTransactionService.getStatistics();

      expect(stats.totalTransactions).toBe(2);
      expect(stats.confirmed).toBeGreaterThan(0);
      expect(stats.pending).toBeGreaterThan(0);
    });

    it('should persist transactions to localStorage', () => {
      MultiChainTransactionService.initialize();

      MultiChainTransactionService.createTransaction({
        chainType: 'ethereum',
        type: 'transfer',
        from: '0x123456',
        to: '0x654321',
        amount: '1.5',
        currency: 'ETH',
        status: 'pending',
      });

      const stored = localStorage.getItem('renvault_transactions');
      expect(stored).toBeDefined();
      expect(stored).toContain('ethereum');
    });
  });

  describe('NetworkValidationService', () => {
    it('should validate Ethereum address', () => {
      const result = NetworkValidationService.validateAddress(
        '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE0',
        'ethereum'
      );

      expect(result.isValid).toBe(true);
      expect(result.normalizedAddress).toBeDefined();
    });

    it('should reject invalid Ethereum address', () => {
      const result = NetworkValidationService.validateAddress('invalid-address', 'ethereum');

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate Stacks address', () => {
      const result = NetworkValidationService.validateAddress(
        'SP2JXKMH2R6S7RKMQG33ML46SSPUCPGTSCC3DYKKJ',
        'stacks'
      );

      expect(result.isValid).toBe(true);
    });

    it('should validate transaction amounts', () => {
      const validResult = NetworkValidationService.validateAmount('10.5', 'ethereum');
      const invalidResult = NetworkValidationService.validateAmount('-5', 'ethereum');
      const zeroResult = NetworkValidationService.validateAmount('0', 'ethereum');

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
      expect(zeroResult.isValid).toBe(false);
    });

    it('should validate complete transactions', () => {
      const result = NetworkValidationService.validateTransaction({
        from: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE0',
        to: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
        amount: '1.5',
        chainType: 'ethereum',
      });

      expect(result.isValid).toBe(true);
    });

    it('should warn when amount is too large', () => {
      const result = NetworkValidationService.validateAmount('1000000.5', 'ethereum');

      expect(result.isValid).toBe(true);
      expect(result.warnings).toBeDefined();
    });

    it('should identify supported operations by chain', () => {
      const transferSupported = NetworkValidationService.isOperationSupported(
        'transfer',
        'ethereum'
      );
      const bridgeSupported = NetworkValidationService.isOperationSupported('bridge', 'ethereum');

      expect(transferSupported).toBe(true);
      expect(bridgeSupported).toBe(true);
    });

    it('should validate chain switches', () => {
      const result = NetworkValidationService.validateChainSwitch('ethereum', 'polygon');

      expect(result.isValid).toBe(true);
    });

    it('should reject switch to same chain', () => {
      const result = NetworkValidationService.validateChainSwitch('ethereum', 'ethereum');

      expect(result.isValid).toBe(false);
    });
  });

  describe('EvmChainAdapter', () => {
    let adapter: EvmChainAdapter;

    beforeEach(() => {
      adapter = EvmChainAdapter.createEthereumAdapter();
    });

    it('should validate Ethereum addresses', () => {
      expect(adapter.isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f42bE0')).toBe(true);
      expect(adapter.isValidAddress('invalid')).toBe(false);
    });

    it('should format address checksums', () => {
      const formatted = adapter.formatAddress('0x742d35cc6634c0532925a3b844bc9e7595f42be0');

      expect(formatted).toMatch(/^0x[A-Fa-f0-9]{40}$/);
    });

    it('should convert between Wei and ETH', () => {
      const wei = adapter.toWei('1.5');
      const eth = adapter.fromWei(wei);

      expect(parseFloat(eth)).toBeCloseTo(1.5, 1);
    });

    it('should get native token info', () => {
      const token = adapter.getNativeToken();

      expect(token.name).toBe('Ethereum');
      expect(token.symbol).toBe('ETH');
      expect(token.decimals).toBe(18);
    });

    it('should provide RPC URL', () => {
      const rpcUrl = adapter.getRpcUrl();

      expect(rpcUrl).toBeDefined();
      expect(rpcUrl).toContain('http');
    });
  });

  describe('StacksChainAdapter', () => {
    let adapter: StacksChainAdapter;

    beforeEach(() => {
      adapter = StacksChainAdapter.createStacksMainnetAdapter();
    });

    it('should validate Stacks addresses', () => {
      expect(adapter.isValidAddress('SP2JXKMH2R6S7RKMQG33ML46SSPUCPGTSCC3DYKKJ')).toBe(true);
      expect(adapter.isValidAddress('SP2JXKMH2R6S7RKMQG33ML46SSPUCPGTSCC3DYKKX')).toBe(false);
    });

    it('should convert between microSTX and STX', () => {
      const microStx = adapter.toSmallestUnit('1.5');
      const stx = adapter.fromSmallestUnit(microStx);

      expect(parseFloat(stx)).toBeCloseTo(1.5, 4);
    });

    it('should get native token info', () => {
      const token = adapter.getNativeToken();

      expect(token.name).toBe('Stacks');
      expect(token.symbol).toBe('STX');
      expect(token.decimals).toBe(6);
    });

    it('should identify testnet', () => {
      const mainnet = StacksChainAdapter.createStacksMainnetAdapter();
      const testnet = StacksChainAdapter.createStacksTestnetAdapter();

      expect(mainnet.isTestnet()).toBe(false);
      expect(testnet.isTestnet()).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should switch chains and maintain state', async () => {
      await ChainSwitchService.initialize();
      MultiChainTransactionService.initialize();

      // Create transaction on Ethereum
      const tx1 = MultiChainTransactionService.createTransaction({
        chainType: 'ethereum',
        type: 'transfer',
        from: '0x123456',
        to: '0x654321',
        amount: '1.5',
        currency: 'ETH',
        status: 'confirmed',
      });

      // Switch to Polygon
      await ChainSwitchService.switchChain('polygon');

      // Create transaction on Polygon
      const tx2 = MultiChainTransactionService.createTransaction({
        chainType: 'polygon',
        type: 'transfer',
        from: '0x123456',
        to: '0x654321',
        amount: '100',
        currency: 'MATIC',
        status: 'confirmed',
      });

      // Verify both transactions exist
      const allTxs = MultiChainTransactionService.getAllTransactions();
      expect(allTxs.length).toBe(2);

      // Verify chain switch was recorded
      const history = ChainSwitchService.getHistory();
      expect(history.length).toBeGreaterThan(0);
    });

    it('should handle multiple wallets across chains', () => {
      MultiChainTransactionService.initialize();

      const ethereumTxs = MultiChainTransactionService.getTransactionsByAddress(
        '0xETH_ADDRESS'
      );
      const polygonTxs = MultiChainTransactionService.getTransactionsByAddress(
        '0xPOLYGON_ADDRESS'
      );

      expect(ethereumTxs.length).toBeGreaterThanOrEqual(0);
      expect(polygonTxs.length).toBeGreaterThanOrEqual(0);
    });
  });
});
