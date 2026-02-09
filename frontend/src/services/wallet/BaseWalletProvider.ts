// services/wallet/BaseWalletProvider.ts
import { WalletProvider, WalletConnection } from '../../types/wallet';
import { ConnectionStateManager } from './ConnectionStateManager';
import { ConnectionHealthMonitor } from './ConnectionHealthMonitor';
import { ReconnectionStrategy } from './ReconnectionStrategy';
import { ConnectionEventEmitter } from './ConnectionEventEmitter';
import { ConnectionMetricsCollector } from './ConnectionMetricsCollector';
import { ConnectionCircuitBreaker } from './ConnectionCircuitBreaker';
import { ConnectionState } from '../../types/connectionState';
import { retryConnection } from '../../utils/connectionRetry';

export abstract class BaseWalletProvider implements WalletProvider {
  abstract id: string;
  abstract name: string;
  icon?: string;

  protected stateManager = new ConnectionStateManager();
  protected healthMonitor = new ConnectionHealthMonitor();
  protected reconnectionStrategy = new ReconnectionStrategy();
  protected eventEmitter = new ConnectionEventEmitter();
  protected metricsCollector = new ConnectionMetricsCollector();
  protected circuitBreaker = new ConnectionCircuitBreaker();

  abstract connect(): Promise<WalletConnection>;
  abstract disconnect(): Promise<void>;
  abstract signTransaction(tx: any): Promise<any>;

  async connectWithRetry(): Promise<WalletConnection> {
    const startTime = Date.now();
    this.stateManager.setState(ConnectionState.CONNECTING);
    this.stateManager.recordAttempt();

    try {
      const connection = await retryConnection(() => this.connect());
      this.stateManager.setState(ConnectionState.CONNECTED);
      this.stateManager.recordSuccess();
      this.metricsCollector.recordConnection(true, Date.now() - startTime);
      this.eventEmitter.emit('connected', connection);
      return connection;
    } catch (error) {
      this.stateManager.setState(ConnectionState.ERROR);
      this.stateManager.recordFailure();
      this.metricsCollector.recordConnection(false, Date.now() - startTime);
      this.eventEmitter.emit('error', error);
      throw error;
    }
  }

  async reconnect(): Promise<WalletConnection> {
    if (!this.reconnectionStrategy.canRetry()) {
      throw new Error('Max reconnection attempts reached');
    }

    this.stateManager.setState(ConnectionState.RECONNECTING);
    this.metricsCollector.recordReconnection();
    this.eventEmitter.emit('reconnecting', {});

    const delay = this.reconnectionStrategy.getNextDelay();
    await new Promise(resolve => setTimeout(resolve, delay));

    return this.connectWithRetry();
  }

  getConnectionState(): ConnectionState {
    return this.stateManager.getState();
  }

  getMetrics() {
    return {
      state: this.stateManager.getMetrics(),
      connection: this.metricsCollector.getStats()
    };
  }

  onConnectionEvent(event: 'connected' | 'disconnected' | 'reconnecting' | 'error', callback: (data: any) => void): void {
    this.eventEmitter.on(event, callback);
  }
}