import { logger } from '../utils/logger';

const log = logger.child('WalletSessionManager');

export class WalletSessionManager {
  private sessions: Map<string, any> = new Map();
  private readonly STORAGE_KEY = 'renvault_wallet_sessions';

  saveSession(address: string, data: any) {
    this.sessions.set(address, {
      ...data,
      timestamp: Date.now(),
      lastActive: Date.now(),
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
      log.error('Failed to persist sessions', e instanceof Error ? e : new Error(String(e)));
    }
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const entries = JSON.parse(data);
        this.sessions = new Map(entries);
        log.debug('Sessions loaded from storage', { count: this.sessions.size });
      }
    } catch (e) {
      log.error('Failed to load sessions', e instanceof Error ? e : new Error(String(e)));
    }
  }

  clearExpiredSessions(maxAge: number = 7 * 24 * 60 * 60 * 1000) {
    const now = Date.now();
    let cleared = 0;
    for (const [address, session] of this.sessions.entries()) {
      if (now - session.timestamp > maxAge) {
        this.sessions.delete(address);
        cleared++;
      }
    }
    if (cleared > 0) {
      log.info('Cleared expired sessions', { cleared });
      this.persistToStorage();
    }
  }
}

export const sessionManager = new WalletSessionManager();
