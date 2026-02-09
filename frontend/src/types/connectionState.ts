export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

export interface ConnectionMetrics {
  attempts: number;
  lastAttempt: number;
  lastSuccess: number;
  failures: number;
}
