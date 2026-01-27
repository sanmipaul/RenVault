/**
 * Theme Persistence Service
 * Handles localStorage and theme preferences persistence
 */

import { ThemeMode } from '../config/appkit-theme';

export interface ThemePreference {
  mode: ThemeMode;
  fontFamily?: 'inter' | 'poppins' | 'system';
  fontSize?: 'sm' | 'base' | 'lg';
  animations?: boolean;
  highContrast?: boolean;
  timestamp: number;
  version: number;
}

export interface ThemeHistory {
  mode: ThemeMode;
  timestamp: number;
}

export class ThemePersistenceService {
  private static readonly STORAGE_KEY = 'renvault_theme_preference';
  private static readonly HISTORY_KEY = 'renvault_theme_history';
  private static readonly SETTINGS_KEY = 'renvault_theme_settings';
  private static readonly VERSION = 1;
  private static readonly MAX_HISTORY = 10;

  /**
   * Save theme preference to localStorage
   */
  static savePreference(preference: Partial<ThemePreference>): boolean {
    try {
      const existing = this.loadPreference();
      const updated: ThemePreference = {
        mode: preference.mode || existing?.mode || 'light',
        fontFamily: preference.fontFamily || existing?.fontFamily || 'inter',
        fontSize: preference.fontSize || existing?.fontSize || 'base',
        animations: preference.animations !== undefined ? preference.animations : existing?.animations ?? true,
        highContrast: preference.highContrast !== undefined ? preference.highContrast : existing?.highContrast ?? false,
        timestamp: Date.now(),
        version: this.VERSION,
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      this.addToHistory(updated.mode);
      return true;
    } catch (error) {
      console.error('Failed to save theme preference:', error);
      return false;
    }
  }

  /**
   * Load theme preference from localStorage
   */
  static loadPreference(): ThemePreference | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const preference = JSON.parse(saved) as ThemePreference;
        // Validate version
        if (preference.version === this.VERSION) {
          return preference;
        }
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
    return null;
  }

  /**
   * Get theme mode from preference
   */
  static getMode(): ThemeMode {
    return this.loadPreference()?.mode || 'light';
  }

  /**
   * Get all theme settings
   */
  static getSettings(): ThemePreference {
    return this.loadPreference() || {
      mode: 'light',
      fontFamily: 'inter',
      fontSize: 'base',
      animations: true,
      highContrast: false,
      timestamp: Date.now(),
      version: this.VERSION,
    };
  }

  /**
   * Update font family preference
   */
  static setFontFamily(family: 'inter' | 'poppins' | 'system'): boolean {
    const preference = this.loadPreference();
    return this.savePreference({
      ...preference,
      fontFamily: family,
    });
  }

  /**
   * Update font size preference
   */
  static setFontSize(size: 'sm' | 'base' | 'lg'): boolean {
    const preference = this.loadPreference();
    return this.savePreference({
      ...preference,
      fontSize: size,
    });
  }

  /**
   * Toggle animations
   */
  static setAnimations(enabled: boolean): boolean {
    const preference = this.loadPreference();
    return this.savePreference({
      ...preference,
      animations: enabled,
    });
  }

  /**
   * Toggle high contrast mode
   */
  static setHighContrast(enabled: boolean): boolean {
    const preference = this.loadPreference();
    return this.savePreference({
      ...preference,
      highContrast: enabled,
    });
  }

  /**
   * Add theme change to history
   */
  private static addToHistory(mode: ThemeMode): void {
    try {
      const history = this.loadHistory();
      const entry: ThemeHistory = {
        mode,
        timestamp: Date.now(),
      };

      history.unshift(entry);

      // Keep only last MAX_HISTORY entries
      if (history.length > this.MAX_HISTORY) {
        history.pop();
      }

      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to update theme history:', error);
    }
  }

  /**
   * Load theme change history
   */
  static loadHistory(): ThemeHistory[] {
    try {
      const saved = localStorage.getItem(this.HISTORY_KEY);
      if (saved) {
        return JSON.parse(saved) as ThemeHistory[];
      }
    } catch (error) {
      console.error('Failed to load theme history:', error);
    }
    return [];
  }

  /**
   * Get theme statistics
   */
  static getStatistics(): {
    lightCount: number;
    darkCount: number;
    lastSwitchTime: number | null;
    averageSwitchTime: number;
  } {
    const history = this.loadHistory();

    if (history.length === 0) {
      return {
        lightCount: 0,
        darkCount: 0,
        lastSwitchTime: null,
        averageSwitchTime: 0,
      };
    }

    const lightCount = history.filter(h => h.mode === 'light').length;
    const darkCount = history.filter(h => h.mode === 'dark').length;

    // Calculate average time between switches
    let totalTime = 0;
    for (let i = 0; i < history.length - 1; i++) {
      totalTime += history[i].timestamp - history[i + 1].timestamp;
    }
    const averageSwitchTime = history.length > 1 ? totalTime / (history.length - 1) : 0;

    return {
      lightCount,
      darkCount,
      lastSwitchTime: history[0]?.timestamp || null,
      averageSwitchTime,
    };
  }

  /**
   * Export preferences as JSON
   */
  static exportPreferences(): string {
    const preference = this.loadPreference();
    const history = this.loadHistory();

    return JSON.stringify(
      {
        preference,
        history,
        exported: new Date().toISOString(),
      },
      null,
      2
    );
  }

  /**
   * Import preferences from JSON
   */
  static importPreferences(json: string): boolean {
    try {
      const data = JSON.parse(json);

      if (data.preference && data.preference.mode) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data.preference));
      }

      if (Array.isArray(data.history)) {
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(data.history));
      }

      return true;
    } catch (error) {
      console.error('Failed to import preferences:', error);
      return false;
    }
  }

  /**
   * Clear all theme data
   */
  static clearAll(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.HISTORY_KEY);
      localStorage.removeItem(this.SETTINGS_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear theme data:', error);
      return false;
    }
  }

  /**
   * Clear history only
   */
  static clearHistory(): boolean {
    try {
      localStorage.removeItem(this.HISTORY_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear theme history:', error);
      return false;
    }
  }

  /**
   * Get storage size
   */
  static getStorageSize(): { bytes: number; kb: number } {
    try {
      const preference = localStorage.getItem(this.STORAGE_KEY) || '';
      const history = localStorage.getItem(this.HISTORY_KEY) || '';
      const settings = localStorage.getItem(this.SETTINGS_KEY) || '';

      const bytes = (preference + history + settings).length;
      return {
        bytes,
        kb: Math.round((bytes / 1024) * 100) / 100,
      };
    } catch (error) {
      console.error('Failed to get storage size:', error);
      return { bytes: 0, kb: 0 };
    }
  }

  /**
   * Migrate preferences (if version changes)
   */
  static migratePreferences(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const preference = JSON.parse(saved) as ThemePreference;

        // Handle version migrations
        if (preference.version < this.VERSION) {
          // Add migration logic here
          preference.version = this.VERSION;
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preference));
        }
      }
    } catch (error) {
      console.error('Failed to migrate preferences:', error);
    }
  }

  /**
   * Check if localStorage is available
   */
  static isStorageAvailable(): boolean {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get storage status
   */
  static getStorageStatus(): {
    available: boolean;
    size: { bytes: number; kb: number };
    hasPreference: boolean;
    hasHistory: boolean;
  } {
    return {
      available: this.isStorageAvailable(),
      size: this.getStorageSize(),
      hasPreference: !!this.loadPreference(),
      hasHistory: this.loadHistory().length > 0,
    };
  }
}

/**
 * React Hook for theme persistence
 */
import React from 'react';

export const useThemePersistence = () => {
  const [settings, setSettings] = React.useState(() => ThemePersistenceService.getSettings());

  React.useEffect(() => {
    ThemePersistenceService.migratePreferences();
  }, []);

  return {
    settings,
    saveMode: (mode: ThemeMode) => {
      const success = ThemePersistenceService.savePreference({ mode });
      if (success) {
        setSettings(ThemePersistenceService.getSettings());
      }
      return success;
    },
    setFontFamily: (family: 'inter' | 'poppins' | 'system') => {
      const success = ThemePersistenceService.setFontFamily(family);
      if (success) {
        setSettings(ThemePersistenceService.getSettings());
      }
      return success;
    },
    setFontSize: (size: 'sm' | 'base' | 'lg') => {
      const success = ThemePersistenceService.setFontSize(size);
      if (success) {
        setSettings(ThemePersistenceService.getSettings());
      }
      return success;
    },
    setAnimations: (enabled: boolean) => {
      const success = ThemePersistenceService.setAnimations(enabled);
      if (success) {
        setSettings(ThemePersistenceService.getSettings());
      }
      return success;
    },
    setHighContrast: (enabled: boolean) => {
      const success = ThemePersistenceService.setHighContrast(enabled);
      if (success) {
        setSettings(ThemePersistenceService.getSettings());
      }
      return success;
    },
    history: ThemePersistenceService.loadHistory(),
    statistics: ThemePersistenceService.getStatistics(),
  };
};
