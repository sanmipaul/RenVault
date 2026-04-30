import { logger } from '../utils/logger';

export interface WalletPreferences {
  defaultWallet?: string;
  autoConnect: boolean;
  showNotifications: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

export class WalletPreferenceManager {
  private readonly STORAGE_KEY = 'renvault_wallet_preferences';
  private preferences: WalletPreferences = {
    autoConnect: true,
    showNotifications: true,
    theme: 'auto',
    language: 'en',
  };

  loadPreferences() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.preferences = { ...this.preferences, ...JSON.parse(stored) };
        log.debug('Preferences loaded', { preferences: this.preferences });
      }
    } catch (e) {
      logger.error('Failed to load preferences:', e);
    }
  }

  savePreferences(prefs: Partial<WalletPreferences>) {
    this.preferences = { ...this.preferences, ...prefs };
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.preferences));
      log.debug('Preferences saved', { updated: Object.keys(prefs) });
    } catch (e) {
      logger.error('Failed to save preferences:', e);
    }
  }

  getPreferences(): WalletPreferences {
    return { ...this.preferences };
  }

  setDefaultWallet(wallet: string) {
    this.savePreferences({ defaultWallet: wallet });
  }

  getDefaultWallet(): string | undefined {
    return this.preferences.defaultWallet;
  }

  shouldAutoConnect(): boolean {
    return this.preferences.autoConnect;
  }

  getTheme(): 'light' | 'dark' | 'auto' {
    return this.preferences.theme;
  }

  reset() {
    this.preferences = {
      autoConnect: true,
      showNotifications: true,
      theme: 'auto',
      language: 'en',
    };
    localStorage.removeItem(this.STORAGE_KEY);
    log.info('Preferences reset to defaults');
  }
}

export const preferenceManager = new WalletPreferenceManager();
