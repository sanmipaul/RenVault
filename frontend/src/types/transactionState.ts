export enum TransactionStatus {
  PENDING = 'pending',
  SIGNING = 'signing',
  BROADCASTING = 'broadcasting',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface TransactionState {
  txId: string;
  status: TransactionStatus;
  timestamp: number;
  retryCount: number;
  error?: string;
}
