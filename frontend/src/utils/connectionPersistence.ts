export class ConnectionPersistence {
  static save<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`conn_${key}`, JSON.stringify(value));
    } catch (error) {
      logger.error('Failed to save connection state:', error);
    }
  }

  static load<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(`conn_${key}`);
      return stored ? (JSON.parse(stored) as T) : null;
    } catch (error) {
      logger.error('Failed to load connection state:', error);
      return null;
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(`conn_${key}`);
  }
}
