/**
 * Theme Utilities
 * Helper functions and utilities for theme management
 */

import { ThemeMode, AppKitThemeConfig } from '../config/appkit-theme';
import { ThemeSwitchService } from '../services/theme/ThemeSwitchService';

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Adjust color brightness
 */
export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const r = Math.min(255, Math.max(0, Math.round(rgb.r + rgb.r * (percent / 100))));
  const g = Math.min(255, Math.max(0, Math.round(rgb.g + rgb.g * (percent / 100))));
  const b = Math.min(255, Math.max(0, Math.round(rgb.b + rgb.b * (percent / 100))));

  return rgbToHex(r, g, b);
}

/**
 * Get contrasting color (black or white)
 */
export function getContrastingColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';

  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Blend two colors
 */
export function blendColors(color1: string, color2: string, ratio: number = 0.5): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return color1;

  const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
  const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
  const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);

  return rgbToHex(r, g, b);
}

/**
 * Validate theme configuration
 */
export function validateThemeConfig(config: Partial<AppKitThemeConfig>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.colors) {
    errors.push('Theme must have colors property');
  }

  if (config.colors) {
    const requiredColors = ['primary', 'background', 'surface', 'text'];
    requiredColors.forEach(color => {
      if (!config.colors || !(color in config.colors)) {
        errors.push(`Missing required color: ${color}`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate theme from color palette
 */
export function generateThemeFromPalette(primaryColor: string): AppKitThemeConfig {
  const darkColor = adjustBrightness(primaryColor, -20);
  const lightColor = adjustBrightness(primaryColor, 20);
  const veryLight = adjustBrightness(primaryColor, 50);

  return {
    colors: {
      primary: primaryColor,
      primaryDark: darkColor,
      primaryLight: lightColor,
      primaryVeryLight: veryLight,
      secondary: blendColors(primaryColor, '#4a5568', 0.5),
      background: '#ffffff',
      surface: '#f7fafc',
      surfaceAlt: '#edf2f7',
      text: '#1a202c',
      textSecondary: '#718096',
      border: '#e2e8f0',
      success: '#48bb78',
      error: '#f56565',
      warning: '#ed8936',
      info: '#4299e1',
      successLight: adjustBrightness('#48bb78', 30),
      errorLight: adjustBrightness('#f56565', 30),
      warningLight: adjustBrightness('#ed8936', 30),
      infoLight: adjustBrightness('#4299e1', 30),
    },
  };
}

/**
 * Merge theme configurations
 */
export function mergeThemeConfigs(
  base: AppKitThemeConfig,
  override: Partial<AppKitThemeConfig>
): AppKitThemeConfig {
  return {
    colors: {
      ...base.colors,
      ...(override.colors || {}),
    },
  };
}

/**
 * Create CSS variable string from theme
 */
export function createCSSVariableString(colors: Record<string, string>): string {
  return Object.entries(colors)
    .map(([key, value]) => `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
    .join('\n');
}

/**
 * Apply CSS variables to element
 */
export function applyCSSVariables(element: HTMLElement, colors: Record<string, string>): void {
  Object.entries(colors).forEach(([key, value]) => {
    element.style.setProperty(
      `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`,
      value
    );
  });
}

/**
 * Remove CSS variables from element
 */
export function removeCSSVariables(element: HTMLElement): void {
  const style = element.getAttribute('style');
  if (style) {
    const cleaned = style.replace(/--color-[a-z-]+:\s*[^;]+;?\s*/g, '');
    if (cleaned.trim()) {
      element.setAttribute('style', cleaned);
    } else {
      element.removeAttribute('style');
    }
  }
}

/**
 * Check if running on mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Check if dark mode is preferred
 */
export function isDarkModePreferred(): boolean {
  if (typeof window === 'undefined') return false;

  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Get system theme preference
 */
export function getSystemTheme(): ThemeMode {
  return isDarkModePreferred() ? 'dark' : 'light';
}

/**
 * Create custom theme
 */
export interface CustomThemeOptions {
  primaryColor: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  successColor?: string;
  errorColor?: string;
  warningColor?: string;
  infoColor?: string;
}

export function createCustomTheme(options: CustomThemeOptions): AppKitThemeConfig {
  const config = generateThemeFromPalette(options.primaryColor);

  if (options.secondaryColor && config.colors) {
    config.colors.secondary = options.secondaryColor;
  }

  if (options.backgroundColor && config.colors) {
    config.colors.background = options.backgroundColor;
  }

  if (options.textColor && config.colors) {
    config.colors.text = options.textColor;
  }

  if (options.successColor && config.colors) {
    config.colors.success = options.successColor;
  }

  if (options.errorColor && config.colors) {
    config.colors.error = options.errorColor;
  }

  if (options.warningColor && config.colors) {
    config.colors.warning = options.warningColor;
  }

  if (options.infoColor && config.colors) {
    config.colors.info = options.infoColor;
  }

  return config;
}

/**
 * Export theme as JSON
 */
export function exportTheme(mode: ThemeMode = 'light'): string {
  const config = ThemeSwitchService.getAppKitConfig();
  return JSON.stringify(config, null, 2);
}

/**
 * Import theme from JSON
 */
export function importTheme(json: string): AppKitThemeConfig | null {
  try {
    const config = JSON.parse(json) as AppKitThemeConfig;
    const validation = validateThemeConfig(config);
    if (validation.valid) {
      return config;
    } else {
      console.error('Invalid theme configuration:', validation.errors);
      return null;
    }
  } catch (error) {
    console.error('Failed to import theme:', error);
    return null;
  }
}

/**
 * Get theme statistics
 */
export function getThemeStatistics(): {
  colorCount: number;
  mode: ThemeMode;
  timestamp: number;
} {
  const config = ThemeSwitchService.getAppKitConfig();
  return {
    colorCount: Object.keys(config.colors || {}).length,
    mode: ThemeSwitchService.getCurrentMode(),
    timestamp: Date.now(),
  };
}

/**
 * Generate color palette variants
 */
export function generateColorVariants(baseColor: string, steps: number = 5): string[] {
  const variants: string[] = [];
  const step = 100 / (steps + 1);

  for (let i = 0; i < steps; i++) {
    variants.push(adjustBrightness(baseColor, (i + 1) * step - 50));
  }

  return variants;
}
