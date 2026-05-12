// TransactionFeeAdjuster.ts
// Adjusts fees based on retry attempts and network conditions

export class TransactionFeeAdjuster {
  private static readonly RETRY_BUMP_PERCENT = 0.25; // 25% bump per retry
  private static readonly MAX_BUMPS = 4;

  static bumpFee(currentFee: number, retryAttempt: number): number {
    const bumps = Math.min(retryAttempt, this.MAX_BUMPS);
    const multiplier = Math.pow(1 + this.RETRY_BUMP_PERCENT, bumps);
    return Math.ceil(currentFee * multiplier);
  }

  static shouldBump(retryAttempt: number): boolean {
    return retryAttempt > 0 && retryAttempt <= this.MAX_BUMPS;
  }

  static getBumpedFeeForRetry(baseFee: number, retryAttempt: number): number {
    if (!this.shouldBump(retryAttempt)) return baseFee;
    return this.bumpFee(baseFee, retryAttempt);
  }
}
