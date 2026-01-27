/**
 * Theme Switching Service
 * Manages theme switching between light and dark modes
 */

import {
  ThemeMode,
  getAppKitThemeConfig,
  getCSSVariables,
  themeDefaults,
  AppKitThemeConfig,
} from '../config/appkit-theme';

export interface ThemeState {
  mode: ThemeMode;
  isSystemPreference: boolean;
  lastUpdated: number;
}

export class ThemeSwitchService {
  private static currentMode: ThemeMode = themeDefaults.mode;
  private static listeners: Set<(mode: ThemeMode) => void> = new Set();
  private static mediaQueryList: MediaQueryList | null = null;
  private static readonly STORAGE_KEY = themeDefaults.storageKey;

  /**
   * Initialize theme service
   */
  static initialize(): void {
    // Load saved preference
    const saved = this.loadThemePreference();
    if (saved) {
      this.currentMode = saved;
    } else if (themeDefaults.enableSystemPreference) {
      // Use system preference
      this.currentMode = this.getSystemPreference();
      this.startSystemPreferenceMonitoring();
    }

    // Apply initial theme
    this.applyTheme(this.currentMode);
  }

  /**
   * Get current theme mode
   */
  static getCurrentMode(): ThemeMode {
    return this.currentMode;
  }

  /**
   * Switch theme mode
   */
  static switchMode(mode: ThemeMode): void {
    if (this.currentMode === mode) return;

    this.currentMode = mode;
    this.applyTheme(mode);
    this.saveThemePreference(mode);
    this.notifyListeners(mode);
  }

  /**
   * Toggle between light and dark
   */
  static toggleMode(): void {
    this.switchMode(this.currentMode === 'light' ? 'dark' : 'light');
  }

  /**
   * Apply theme to DOM
   */
  private static applyTheme(mode: ThemeMode): void {
    // Apply to document root
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(mode);

    // Apply CSS variables
    this.applyCSSVariables(mode);

    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent('themechange', {
        detail: { mode },
      })
    );
  }

  /**
   * Apply CSS custom properties
   */
  private static applyCSSVariables(mode: ThemeMode): void {
    const variables = getCSSVariables(mode);
    const root = document.documentElement;

    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value as string);
    });
  }

  /**
   * Get system preference
   */
  private static getSystemPreference(): ThemeMode {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Start monitoring system preference changes
   */
  private static startSystemPreferenceMonitoring(): void {
    if (!window.matchMedia) return;

    this.mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const newMode: ThemeMode = e.matches ? 'dark' : 'light';

      // Only switch if not manually set
      const saved = this.loadThemePreference();
      if (!saved) {
        this.currentMode = newMode;
        this.applyTheme(newMode);
        this.notifyListeners(newMode);
      }
    };

    if (this.mediaQueryList.addEventListener) {
      this.mediaQueryList.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      this.mediaQueryList.addListener(handleChange);
    }
  }

  /**
   * Stop monitoring system preference
   */
  private static stopSystemPreferenceMonitoring(): void {
    if (!this.mediaQueryList) return;

    if (this.mediaQueryList.removeEventListener) {
      this.mediaQueryList.removeEventListener('change', () => {});
    } else {
      // Fallback for older browsers
      this.mediaQueryList.removeListener(() => {});
    }

    this.mediaQueryList = null;
  }

  /**
   * Get AppKit theme config
   */
  static getAppKitConfig(): AppKitThemeConfig {
    return getAppKitThemeConfig(this.currentMode);
  }

  /**
   * Save theme preference to localStorage
   */
  private static saveThemePreference(mode: ThemeMode): void {
    if (!themeDefaults.persistToLocalStorage) return;

    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          mode,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }

  /**
   * Load theme preference from localStorage
   */
  private static loadThemePreference(): ThemeMode | null {
    if (!themeDefaults.persistToLocalStorage) return null;

    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const { mode } = JSON.parse(saved);
        return mode as ThemeMode;
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }

    return null;
  }

  /**
   * Clear saved preference
   */
  static clearPreference(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear theme preference:', error);
    }
  }

  /**
   * Subscribe to theme changes
   */
  static onThemeChange(listener: (mode: ThemeMode) => void): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private static notifyListeners(mode: ThemeMode): void {
    this.listeners.forEach(listener => {
      try {
        listener(mode);
      } catch (error) {
        console.error('Theme listener error:', error);
      }
    });
  }

  /**
   * Get theme state
   */
  static getState(): ThemeState {
    return {
      mode: this.currentMode,
      isSystemPreference: !this.loadThemePreference(),
      lastUpdated: Date.now(),
    };
  }

  /**
   * Reset to system preference
   */
  static resetToSystemPreference(): void {
    this.clearPreference();
    this.stopSystemPreferenceMonitoring();
    this.startSystemPreferenceMonitoring();

    const mode = this.getSystemPreference();
    this.currentMode = mode;
    this.applyTheme(mode);
    this.notifyListeners(mode);
  }

  /**
   * Cleanup
   */
  static destroy(): void {
    this.stopSystemPreferenceMonitoring();
    this.listeners.clear();
  }
}

/**
 * React Hook for theme switching
 */
import React from 'react';

export const useTheme = () => {
  const [mode, setMode] = React.useState<ThemeMode>(() =>
    ThemeSwitchService.getCurrentMode()
  );

  React.useEffect(() => {
    const unsubscribe = ThemeSwitchService.onThemeChange(setMode);
    return unsubscribe;
  }, []);

  return {
    mode,
    switchMode: (newMode: ThemeMode) => ThemeSwitchService.switchMode(newMode),
    toggleMode: () => ThemeSwitchService.toggleMode(),
    config: ThemeSwitchService.getAppKitConfig(),
  };
};

/**
 * Initialize theme on module load
 */
if (typeof window !== 'undefined') {
  ThemeSwitchService.initialize();
}
