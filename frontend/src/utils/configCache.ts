export interface CachedConfig<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version?: string;
}

export class ConfigCache {
  private cache: Map<string, CachedConfig<any>> = new Map();
  private readonly VERSION = '1.0.0';

  set<T>(key: string, data: T, ttl: number = 300000): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl, version: this.VERSION });
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    if (cached.version !== this.VERSION) {
      this.cache.delete(key);
      return null;
    }
    return cached.data as T;
  }

  getAge(key: string): number | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    return Date.now() - cached.timestamp;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  size(): number {
    return this.cache.size;
  }
}

export const configCache = new ConfigCache();
