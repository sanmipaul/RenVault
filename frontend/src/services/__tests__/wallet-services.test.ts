import { WalletSessionManager } from '../wallet-session';
import { WalletAnalytics } from '../wallet-analytics';
import { NetworkDetector } from '../network-detector';
import { WalletStateManager } from '../wallet-state';

describe('Wallet Services', () => {
  describe('SessionManager', () => {
    let manager: WalletSessionManager;

    beforeEach(() => {
      manager = new WalletSessionManager();
    });

    test('should save and retrieve session', () => {
      manager.saveSession('SP123', { wallet: 'hiro' });
      const session = manager.getSession('SP123');
      expect(session).toBeDefined();
      expect(session.wallet).toBe('hiro');
    });

    test('should remove session', () => {
      manager.saveSession('SP123', { wallet: 'hiro' });
      manager.removeSession('SP123');
      expect(manager.getSession('SP123')).toBeUndefined();
    });
  });

  describe('WalletAnalytics', () => {
    let analytics: WalletAnalytics;

    beforeEach(() => {
      analytics = new WalletAnalytics();
    });

    test('should track connections', () => {
      analytics.trackConnection('hiro', true, 1000);
      const stats = analytics.getConnectionStats();
      expect(stats.total).toBe(1);
      expect(stats.successful).toBe(1);
    });

    test('should calculate average duration', () => {
      analytics.trackConnection('hiro', true, 1000);
      analytics.trackConnection('hiro', true, 2000);
      const stats = analytics.getConnectionStats();
      expect(stats.avgDuration).toBe(1500);
    });
  });

  describe('NetworkDetector', () => {
    let detector: NetworkDetector;

    beforeEach(() => {
      detector = new NetworkDetector();
    });

    test('should detect network', () => {
      const network = detector.detectNetwork();
      expect(['mainnet', 'testnet']).toContain(network);
    });

    test('should switch network', () => {
      detector.switchNetwork('testnet');
      expect(detector.getCurrentNetwork()).toBe('testnet');
    });
  });

  describe('WalletStateManager', () => {
    let stateManager: WalletStateManager;

    beforeEach(() => {
      stateManager = new WalletStateManager();
    });

    test('should update state', () => {
      stateManager.setState('connected');
      expect(stateManager.getState()).toBe('connected');
      expect(stateManager.isConnected()).toBe(true);
    });

    test('should notify listeners', (done) => {
      stateManager.onStateChange((state) => {
        expect(state).toBe('connected');
        done();
      });
      stateManager.setState('connected');
    });
  });
});
