export interface CachedConfig<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class ConfigCache {
  private cache: Map<string, CachedConfig<any>> = new Map();

  set<T>(key: string, data: T, ttl: number = 300000): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    return cached.data as T;
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
}

export const configCache = new ConfigCache();
