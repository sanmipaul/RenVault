// TransactionFeeCache.ts
// Caches fee estimates to avoid redundant recalculations

import { FeeEstimate } from './TransactionFeeEstimator';

export class TransactionFeeCache {
  private cached: FeeEstimate | null = null;
  private readonly TTL_MS: number;
  private hitCount = 0;
  private missCount = 0;

  constructor(ttlMs: number = 30_000) {
    this.TTL_MS = ttlMs;
  }

  set(estimate: FeeEstimate): void {
    this.cached = estimate;
  }

  get(): FeeEstimate | null {
    if (!this.cached) {
      this.missCount++;
      return null;
    }
    if (Date.now() - this.cached.estimatedAt > this.TTL_MS) {
      this.cached = null;
      this.missCount++;
      return null;
    }
    this.hitCount++;
    return this.cached;
  }

  isValid(): boolean {
    return this.get() !== null;
  }

  invalidate(): void {
    this.cached = null;
  }

  getAge(): number | null {
    if (!this.cached) return null;
    return Date.now() - this.cached.estimatedAt;
  }

  getRemainingTTL(): number {
    const age = this.getAge();
    if (age === null) return 0;
    return Math.max(0, this.TTL_MS - age);
  }

  getStats(): { hits: number; misses: number; hitRate: number } {
    const total = this.hitCount + this.missCount;
    return {
      hits: this.hitCount,
      misses: this.missCount,
      hitRate: total === 0 ? 0 : this.hitCount / total,
    };
  }
}
