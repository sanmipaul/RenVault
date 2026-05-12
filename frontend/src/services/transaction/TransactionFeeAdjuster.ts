// TransactionFeeAdjuster.ts
// Adjusts fees based on retry attempts and network conditions

export class TransactionFeeAdjuster {
  static readonly RETRY_BUMP_PERCENT = 0.25; // 25% bump per retry
  private static readonly MAX_BUMPS = 4;
  private static readonly MIN_BUMP_FEE = 180;
  static readonly MAX_BUMPS_PUBLIC = 4; // exposed for external use

  static bumpFee(currentFee: number, retryAttempt: number): number {
    const bumps = Math.min(retryAttempt, this.MAX_BUMPS);
    const multiplier = Math.pow(1 + this.RETRY_BUMP_PERCENT, bumps);
    return Math.max(this.MIN_BUMP_FEE, Math.ceil(currentFee * multiplier));
  }

  static shouldBump(retryAttempt: number): boolean {
    return retryAttempt > 0 && retryAttempt <= this.MAX_BUMPS;
  }

  static getBumpedFeeForRetry(baseFee: number, retryAttempt: number): number {
    if (!this.shouldBump(retryAttempt)) return baseFee;
    return this.bumpFee(baseFee, retryAttempt);
  }

  getMaxBumpedFee(baseFee: number): number {
    return this.bumpFee(baseFee, this.MAX_BUMPS);
  }

  static getBumpSchedule(baseFee: number): number[] {
    return Array.from({ length: TransactionFeeAdjuster.MAX_BUMPS + 1 }, (_, i) =>
      TransactionFeeAdjuster.bumpFee(baseFee, i)
    );
  }

  static formatBumpSchedule(baseFee: number): string {
    return TransactionFeeAdjuster.getBumpSchedule(baseFee)
      .map((fee, i) => `Attempt ${i + 1}: ${fee} μSTX`)
      .join(', ');
  }
}
