export class ConnectionPool {
  private connections: Map<string, any> = new Map();
  private maxSize: number;

  constructor(maxSize: number = 10) {
    this.maxSize = maxSize;
  }

  add(id: string, connection: any): void {
    if (this.connections.size >= this.maxSize) {
      const firstKey = this.connections.keys().next().value;
      this.connections.delete(firstKey);
    }
    this.connections.set(id, connection);
  }

  get(id: string): any {
    return this.connections.get(id);
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
