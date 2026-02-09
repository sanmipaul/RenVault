export interface RetryOptions {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier: number;
}

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = { maxRetries: 3, delayMs: 1000, backoffMultiplier: 2 }
): Promise<T> => {
  let lastError: Error;
  for (let i = 0; i < options.maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < options.maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, options.delayMs * Math.pow(options.backoffMultiplier, i)));
      }
    }
  }
  throw lastError!;
};
