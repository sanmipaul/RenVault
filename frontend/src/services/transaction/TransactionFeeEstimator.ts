// TransactionFeeEstimator.ts
// Provides dynamic fee estimation for Stacks transactions

export interface FeeEstimate {
  low: number;
  medium: number;
  high: number;
  recommended: number;
  estimatedAt: number;
}

export interface FeeEstimationOptions {
  priority?: 'low' | 'medium' | 'high';
  transactionSizeBytes?: number;
  networkCongestion?: number; // 0-1 scale
  functionArgsCount?: number; // number of clarity args affects size
}

const BASE_FEE = 180; // minimum fee in microSTX
const FEE_PER_BYTE = 1; // microSTX per byte
const DEFAULT_TX_SIZE = 180; // bytes
const CONTRACT_CALL_OVERHEAD = 50; // extra bytes for contract call overhead

export class TransactionFeeEstimator {
  private static readonly CONGESTION_MULTIPLIERS = {
    low: 0.8,
    medium: 1.0,
    high: 1.5,
  };

  estimateFee(options: FeeEstimationOptions = {}): FeeEstimate {
    const {
      transactionSizeBytes = DEFAULT_TX_SIZE,
      networkCongestion = 0.5,
      functionArgsCount = 1,
    } = options;

    const argsOverhead = functionArgsCount * 8;
    const effectiveSize = transactionSizeBytes + CONTRACT_CALL_OVERHEAD + argsOverhead;
    const baseFee = Math.max(BASE_FEE, effectiveSize * FEE_PER_BYTE);
    const congestionFactor = 1 + networkCongestion;

    const low = Math.ceil(baseFee * TransactionFeeEstimator.CONGESTION_MULTIPLIERS.low);
    const medium = Math.ceil(baseFee * TransactionFeeEstimator.CONGESTION_MULTIPLIERS.medium * congestionFactor);
    const high = Math.ceil(baseFee * TransactionFeeEstimator.CONGESTION_MULTIPLIERS.high * congestionFactor);

    return {
      low,
      medium,
      high,
      recommended: medium,
      estimatedAt: Date.now(),
    };
  }

  getFeeForPriority(priority: 'low' | 'medium' | 'high', options: FeeEstimationOptions = {}): number {
    const estimate = this.estimateFee(options);
    return estimate[priority];
  }

  isStale(estimate: FeeEstimate, maxAgeMs: number = 30_000): boolean {
    return Date.now() - estimate.estimatedAt > maxAgeMs;
  }
}
