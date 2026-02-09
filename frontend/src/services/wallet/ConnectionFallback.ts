export class ConnectionFallback {
  private fallbacks: Array<() => Promise<any>> = [];

  add(fallbackFn: () => Promise<any>): void {
    this.fallbacks.push(fallbackFn);
  }

  async execute(): Promise<any> {
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
