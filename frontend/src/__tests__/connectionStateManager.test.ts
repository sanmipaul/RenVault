import { ConnectionStateManager } from '../services/wallet/ConnectionStateManager';
import { ConnectionState } from '../types/connectionState';

describe('ConnectionStateManager', () => {
  it('should initialize with disconnected state', () => {
    const manager = new ConnectionStateManager();
    expect(manager.getState()).toBe(ConnectionState.DISCONNECTED);
  });

  it('should record connection attempts', () => {
    const manager = new ConnectionStateManager();
    manager.recordAttempt();
    const metrics = manager.getMetrics();
    expect(metrics.attempts).toBe(1);
  });

  it('should record connection success', () => {
    const manager = new ConnectionStateManager();
    manager.recordSuccess();
    const metrics = manager.getMetrics();
    expect(metrics.lastSuccess).toBeGreaterThan(0);
  });
});
