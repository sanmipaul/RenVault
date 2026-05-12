// TransactionFeeCache.ts
// Caches fee estimates to avoid redundant recalculations

import { FeeEstimate } from './TransactionFeeEstimator';

export class TransactionFeeCache {
  private cached: FeeEstimate | null = null;
  private readonly TTL_MS: number;

  constructor(ttlMs: number = 30_000) {
    this.TTL_MS = ttlMs;
  }

  set(estimate: FeeEstimate): void {
    this.cached = estimate;
  }

  get(): FeeEstimate | null {
    if (!this.cached) return null;
    if (Date.now() - this.cached.estimatedAt > this.TTL_MS) {
      this.cached = null;
      return null;
    }
    return this.cached;
  }

  isValid(): boolean {
    return this.get() !== null;
  }

  invalidate(): void {
    this.cached = null;
  }
}
