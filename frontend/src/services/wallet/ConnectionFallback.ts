export class ConnectionFallback {
  private fallbacks: Array<() => Promise<unknown>> = [];

  add(fallbackFn: () => Promise<unknown>): void {
    this.fallbacks.push(fallbackFn);
  }

  async execute(): Promise<unknown> {
    for (const fallback of this.fallbacks) {
      try {
        return await fallback();
      } catch (error) {
        continue;
      }
    }
    throw new Error('All fallback attempts failed');
  }

  clear(): void {
    this.fallbacks = [];
  }
}
