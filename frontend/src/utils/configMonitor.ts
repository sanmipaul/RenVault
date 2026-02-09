export interface ConfigMetrics {
  validationErrors: number;
  validationSuccesses: number;
  cacheHits: number;
  cacheMisses: number;
  lastValidation: number;
}

class ConfigMonitor {
  private metrics: ConfigMetrics = { validationErrors: 0, validationSuccesses: 0, cacheHits: 0, cacheMisses: 0, lastValidation: 0 };

  recordValidationError(): void {
    this.metrics.validationErrors++;
    this.metrics.lastValidation = Date.now();
  }

  recordValidationSuccess(): void {
    this.metrics.validationSuccesses++;
    this.metrics.lastValidation = Date.now();
  }

  recordCacheHit(): void {
    this.metrics.cacheHits++;
  }

  recordCacheMiss(): void {
    this.metrics.cacheMisses++;
  }

  getMetrics(): ConfigMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = { validationErrors: 0, validationSuccesses: 0, cacheHits: 0, cacheMisses: 0, lastValidation: 0 };
  }
}

export const configMonitor = new ConfigMonitor();
