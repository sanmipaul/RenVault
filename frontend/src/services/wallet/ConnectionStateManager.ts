import { ConnectionState, ConnectionMetrics } from '../../types/connectionState';

export class ConnectionStateManager {
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private metrics: ConnectionMetrics = { attempts: 0, lastAttempt: 0, lastSuccess: 0, failures: 0 };

  setState(state: ConnectionState): void {
    this.state = state;
  }

  getState(): ConnectionState {
    return this.state;
  }

  recordAttempt(): void {
    this.metrics.attempts++;
    this.metrics.lastAttempt = Date.now();
  }

  recordSuccess(): void {
    this.metrics.lastSuccess = Date.now();
  }

  recordFailure(): void {
    this.metrics.failures++;
  }

  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.state = ConnectionState.DISCONNECTED;
    this.metrics = { attempts: 0, lastAttempt: 0, lastSuccess: 0, failures: 0 };
  }
}
