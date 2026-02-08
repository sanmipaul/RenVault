export interface WalletConnectionData {
  address: string;
  walletType: string;
  network: string;
  timestamp: number;
}

export interface WalletSession {
  address: string;
  walletType: string;
  timestamp: number;
  lastActive: number;
  metadata?: Record<string, any>;
}

export interface ConnectionStats {
  total: number;
  successful: number;
  failed: number;
  avgDuration: number;
}

export interface NetworkConfig {
  network: string;
  chainId: string;
  apiUrl: string;
}

export interface HealthStatus {
  healthy: boolean;
  lastCheck: number;
  timeSinceCheck: number;
}

export interface TransactionValidation {
  valid: boolean;
  warnings: string[];
}

export interface CacheStats {
  size: number;
  keys: string[];
}
