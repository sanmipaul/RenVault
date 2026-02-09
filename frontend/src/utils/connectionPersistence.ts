export class ConnectionPersistence {
  static save(key: string, value: any): void {
    try {
      localStorage.setItem(`conn_${key}`, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save connection state:', error);
    }
  }

  static load(key: string): any {
    try {
      const stored = localStorage.getItem(`conn_${key}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load connection state:', error);
      return null;
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(`conn_${key}`);
  }
}
