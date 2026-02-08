export class WalletSessionManager {
  private sessions: Map<string, any> = new Map();
  private readonly STORAGE_KEY = 'renvault_wallet_sessions';

  saveSession(address: string, data: any) {
    this.sessions.set(address, {
      ...data,
      timestamp: Date.now(),
      lastActive: Date.now()
    });
    this.persistToStorage();
  }

  getSession(address: string) {
    return this.sessions.get(address);
  }

  removeSession(address: string) {
    this.sessions.delete(address);
    this.persistToStorage();
  }

  getAllSessions() {
    return Array.from(this.sessions.entries());
  }

  updateLastActive(address: string) {
    const session = this.sessions.get(address);
    if (session) {
      session.lastActive = Date.now();
      this.sessions.set(address, session);
      this.persistToStorage();
    }
  }

  private persistToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(Array.from(this.sessions.entries())));
    } catch (e) {
      console.error('Failed to persist sessions:', e);
    }
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const entries = JSON.parse(data);
        this.sessions = new Map(entries);
      }
    } catch (e) {
      console.error('Failed to load sessions:', e);
    }
  }

  clearExpiredSessions(maxAge: number = 7 * 24 * 60 * 60 * 1000) {
    const now = Date.now();
    for (const [address, session] of this.sessions.entries()) {
      if (now - session.timestamp > maxAge) {
        this.sessions.delete(address);
      }
    }
    this.persistToStorage();
  }
}

export const sessionManager = new WalletSessionManager();
