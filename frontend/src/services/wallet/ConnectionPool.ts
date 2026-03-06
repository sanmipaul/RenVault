export class ConnectionPool {
  private connections: Map<string, any> = new Map();
  private maxSize: number;
  private onEvict?: (id: string, connection: any) => void;

  constructor(maxSize: number = 10, onEvict?: (id: string, connection: any) => void) {
    this.maxSize = maxSize;
    this.onEvict = onEvict;
  }

  add(id: string, connection: any): void {
    if (this.connections.has(id)) {
      throw new Error(`ConnectionPool: connection "${id}" already exists. Use update() to replace it.`);
    }
    if (this.connections.size >= this.maxSize) {
      const firstKey = this.connections.keys().next().value as string;
      const evicted = this.connections.get(firstKey);
      this.connections.delete(firstKey);
      this.onEvict?.(firstKey, evicted);
    }
    this.connections.set(id, connection);
  }

  update(id: string, connection: any): void {
    if (!this.connections.has(id)) {
      throw new Error(`ConnectionPool: connection "${id}" does not exist. Use add() to register a new connection.`);
    }
    this.connections.set(id, connection);
  }

  get(id: string): any {
    return this.connections.get(id);
  }

  has(id: string): boolean {
    return this.connections.has(id);
  }

  remove(id: string): void {
    this.connections.delete(id);
  }

  clear(): void {
    this.connections.clear();
  }

  size(): number {
    return this.connections.size;
  }
}
