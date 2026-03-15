export class ConnectionPool<T = unknown> {
  private connections: Map<string, T> = new Map();
  private maxSize: number;
  private onEvict?: (id: string, connection: T) => void;

  constructor(maxSize: number = 10, onEvict?: (id: string, connection: T) => void) {
    this.maxSize = maxSize;
    this.onEvict = onEvict;
  }

  add(id: string, connection: T): void {
    if (this.connections.has(id)) {
      throw new Error(`ConnectionPool: connection "${id}" already exists. Use update() to replace it.`);
    }
    if (this.connections.size >= this.maxSize) {
      const firstKey = this.connections.keys().next().value as string;
      const evicted = this.connections.get(firstKey);
      this.connections.delete(firstKey);
      if (evicted !== undefined) this.onEvict?.(firstKey, evicted);
    }
    this.connections.set(id, connection);
  }

  update(id: string, connection: T): void {
    if (!this.connections.has(id)) {
      throw new Error(`ConnectionPool: connection "${id}" does not exist. Use add() to register a new connection.`);
    }
    this.connections.set(id, connection);
  }

  get(id: string): T | undefined {
    return this.connections.get(id);
  }

  has(id: string): boolean {
    return this.connections.has(id);
  }

  remove(id: string): T | undefined {
    const connection = this.connections.get(id);
    this.connections.delete(id);
    return connection;
  }

  clear(): void {
    this.connections.clear();
  }

  size(): number {
    return this.connections.size;
  }
}
