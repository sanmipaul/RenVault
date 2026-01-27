/**
 * Theme Integration Hook
 * Hook to integrate theme switching into existing App component
 */

import { useEffect } from 'react';
import { ThemeSwitchService, useTheme } from '../services/theme/ThemeSwitchService';
import { ThemePersistenceService } from '../services/theme/ThemePersistenceService';
import { TypographyService } from '../services/theme/TypographyService';
import { LogoService } from '../services/theme/LogoService';
import { injectModalStyles, updateModalStyles } from '../styles/modalStyles';
import { injectButtonStyles, updateButtonStyles } from '../styles/buttonStyles';
import { injectResponsiveStyles } from '../styles/responsiveTheme';

/**
 * Hook to initialize theme system
 */
export function useThemeInitialization() {
  const { mode } = useTheme();

  useEffect(() => {
    // Initialize theme on first load
    initializeThemeSystem();
  }, []);

  useEffect(() => {
    // Update styles when theme changes
    updateAllThemeStyles(mode);
  }, [mode]);

  return {
    mode,
    updateStyles: updateAllThemeStyles,
  };
}

/**
 * Initialize the complete theme system
 */
async function initializeThemeSystem() {
  try {
    // Load custom fonts
    await TypographyService.loadFonts({
      preload: true,
      display: 'swap',
      timeout: 5000,
    });

    // Preload logos
    await LogoService.preloadAllLogos();

    // Inject responsive styles
    injectResponsiveStyles();

    // Apply initial theme
    const currentMode = ThemeSwitchService.getCurrentMode();
    updateAllThemeStyles(currentMode);

    // Apply CSS variables to root
    applyCSSVariablesToRoot(currentMode);
  } catch (error) {
    console.error('Failed to initialize theme system:', error);
  }
}

/**
 * Update all theme-related styles
 */
export function updateAllThemeStyles(mode: 'light' | 'dark') {
  try {
    // Update modal styles
    updateModalStyles(mode);

    // Update button styles
    updateButtonStyles(mode);

    // Update document attributes
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(mode);

    // Update AppKit theme
    updateAppKitTheme(mode);
  } catch (error) {
    console.error('Failed to update theme styles:', error);
  }
}

/**
 * Apply CSS variables to root element
 */
function applyCSSVariablesToRoot(mode: 'light' | 'dark') {
  const root = document.documentElement;
  const config = ThemeSwitchService.getAppKitConfig();

  if (config.colors) {
    Object.entries(config.colors).forEach(([key, value]) => {
      const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVarName, value);
    });
  }
}

/**
 * Update AppKit with new theme
 */
function updateAppKitTheme(mode: 'light' | 'dark') {
  const config = ThemeSwitchService.getAppKitConfig();

  // Dispatch event for AppKit to listen
  window.dispatchEvent(
    new CustomEvent('appkit-theme-change', {
      detail: { config, mode },
    })
  );

  // Update AppKit modal theme
  const appKitModal = document.querySelector('[role="dialog"]');
  if (appKitModal) {
    const computedStyle = window.getComputedStyle(appKitModal);
    // AppKit will pick up CSS variables automatically
  }
}

/**
 * Hook for theme toggle button
 */
export function useThemeToggle() {
  const { mode, toggleMode } = useTheme();

  return {
    currentMode: mode,
    isDark: mode === 'dark',
    toggle: toggleMode,
    switchTo: (newMode: 'light' | 'dark') => {
      if (mode !== newMode) {
        toggleMode();
      }
    },
  };
}

/**
 * Hook for theme customization
 */
export function useThemeCustomization() {
  const { settings } = ThemePersistenceService.loadPreference() || {
    settings: ThemePersistenceService.getSettings(),
  };

  return {
    fontFamily: settings?.fontFamily,
    fontSize: settings?.fontSize,
    animations: settings?.animations,
    highContrast: settings?.highContrast,
    setFontFamily: (family: 'inter' | 'poppins' | 'system') =>
      ThemePersistenceService.setFontFamily(family),
    setFontSize: (size: 'sm' | 'base' | 'lg') => ThemePersistenceService.setFontSize(size),
    setAnimations: (enabled: boolean) => ThemePersistenceService.setAnimations(enabled),
    setHighContrast: (enabled: boolean) => ThemePersistenceService.setHighContrast(enabled),
  };
}

/**
 * Theme Provider configuration
 */
export const themeConfig = {
  enableSystemPreference: true,
  persistToLocalStorage: true,
  initialMode: 'light' as const,
  storageKey: 'renvault_theme',
};

/**
 * CSS variables injection into head
 */
export function injectThemeStyles() {
  const styleId = 'renvault-theme-variables';

  // Check if already injected
  if (document.getElementById(styleId)) {
    return;
  }

  const mode = ThemeSwitchService.getCurrentMode();
  const config = ThemeSwitchService.getAppKitConfig();

  let css = `:root[data-theme="${mode}"] {\n`;

  if (config.colors) {
    Object.entries(config.colors).forEach(([key, value]) => {
      const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      css += `  ${cssVarName}: ${value};\n`;
    });
  }

  css += '}\n';

  // Create and inject style element
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = css;

  if (document.head) {
    document.head.appendChild(style);
  }
}

/**
 * Setup theme change listeners
 */
export function setupThemeListeners() {
  // Listen for AppKit theme changes
  window.addEventListener('appkit-theme-change', (event: any) => {
    console.log('AppKit theme changed:', event.detail);
  });

  // Listen for custom theme changes
  window.addEventListener('themechange', (event: any) => {
    console.log('Theme changed to:', event.detail.mode);
  });

  // Listen for media query changes
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  darkModeQuery.addEventListener('change', (e) => {
    console.log('System theme preference changed to:', e.matches ? 'dark' : 'light');
  });
}

/**
 * Get current theme configuration
 */
export function getCurrentThemeConfig() {
  return {
    mode: ThemeSwitchService.getCurrentMode(),
    config: ThemeSwitchService.getAppKitConfig(),
    settings: ThemePersistenceService.getSettings(),
  };
}
