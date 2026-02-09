export class ConnectionCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly ttl: number;

  constructor(ttl: number = 300000) {
    this.ttl = ttl;
  }

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }
}
