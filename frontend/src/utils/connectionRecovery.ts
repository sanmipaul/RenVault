export class ConnectionRecovery {
  private static readonly STORAGE_KEY = 'connection_state';

  static save(providerId: string, data: any): void {
    const stored = this.getAll();
    stored[providerId] = { ...data, savedAt: Date.now() };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored));
  }

  static get(providerId: string): any {
    const stored = this.getAll();
    return stored[providerId];
  }

  static getAll(): Record<string, any> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  static clear(providerId: string): void {
    const stored = this.getAll();
    delete stored[providerId];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored));
  }
}
