interface ConnectionSnapshot {
  [key: string]: unknown;
  savedAt: number;
}

export class ConnectionRecovery {
  private static readonly STORAGE_KEY = 'connection_state';

  static save(providerId: string, data: Record<string, unknown>): void {
    const stored = this.getAll();
    stored[providerId] = { ...data, savedAt: Date.now() };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored));
  }

  static get(providerId: string): ConnectionSnapshot | undefined {
    const stored = this.getAll();
    return stored[providerId];
  }

  static getAll(): Record<string, ConnectionSnapshot> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Record<string, ConnectionSnapshot>) : {};
  }

  static clear(providerId: string): void {
    const stored = this.getAll();
    delete stored[providerId];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored));
  }
}
