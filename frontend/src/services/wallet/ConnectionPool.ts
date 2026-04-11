export class ConnectionPool<T = unknown> {
  private connections: Map<string, T> = new Map();
  private maxSize: number;
  private onEvict?: (id: string, connection: T) => void;

  constructor(maxSize: number = 10, onEvict?: (id: string, connection: T) => void) {
    this.maxSize = maxSize;
    this.onEvict = onEvict;
    this.ttl = ttl;
  }

  private isExpired(entry: { createdAt: number }): boolean {
    return Date.now() - entry.createdAt > this.ttl;
  }

  private evictExpired(): void {
    for (const [id, entry] of this.connections) {
      if (this.isExpired(entry)) {
        this.connections.delete(id);
        this.onEvict?.(id, entry.connection);
      }
    }
  }

  add(id: string, connection: T): void {
    if (this.connections.has(id)) {
      throw new Error(`ConnectionPool: connection "${id}" already exists. Use update() to replace it.`);
    }
    this.evictExpired();
    if (this.connections.size >= this.maxSize) {
      const firstKey = this.connections.keys().next().value as string;
      const evicted = this.connections.get(firstKey)!;
      this.connections.delete(firstKey);
      if (evicted !== undefined) this.onEvict?.(firstKey, evicted);
    }
    this.connections.set(id, { connection, createdAt: Date.now() });
  }

  update(id: string, connection: T): void {
    if (!this.connections.has(id)) {
      throw new Error(`ConnectionPool: connection "${id}" does not exist. Use add() to register a new connection.`);
    }
    this.connections.set(id, { connection, createdAt: Date.now() });
  }

  get(id: string): T | undefined {
    return this.connections.get(id);
  }

  has(id: string): boolean {
    const entry = this.connections.get(id);
    if (!entry) return false;
    if (this.isExpired(entry)) {
      this.connections.delete(id);
      this.onEvict?.(id, entry.connection);
      return false;
    }
    return true;
  }

  remove(id: string): T | undefined {
    const connection = this.connections.get(id);
    this.connections.delete(id);
    return entry?.connection;
  }

  clear(): void {
    this.connections.clear();
  }

  size(): number {
    this.evictExpired();
    return this.connections.size;
  }
}
