/**
 * AppKit Theme Configuration
 * Comprehensive theme customization for RenVault branding
 */

export type ThemeMode = 'light' | 'dark';
export type ThemeName = 'renvault' | 'custom';

/**
 * RenVault Brand Colors
 */
export const renvaultColors = {
  // Primary Colors
  primary: '#4a80f5', // Brand Blue
  primaryLight: '#6a96f7',
  primaryDark: '#2d5fd9',
  
  // Secondary Colors
  secondary: '#8b5cf6', // Purple
  secondaryLight: '#a78bfa',
  secondaryDark: '#6d28d9',
  
  // Status Colors
  success: '#4af55a', // Green
  successLight: '#6af570',
  successDark: '#22c55e',
  
  error: '#f54a4a', // Red
  errorLight: '#f76a6a',
  errorDark: '#dc2626',
  
  warning: '#f59e4a', // Orange
  warningLight: '#f7b66a',
  warningDark: '#d97706',
  
  info: '#4af5f5', // Cyan
  infoLight: '#6af5f5',
  infoDark: '#06b6d4',
  
  // Neutral Colors
  background: '#ffffff',
  backgroundAlt: '#f8f9fa',
  surface: '#ffffff',
  surfaceVariant: '#f5f5f5',
  
  // Text Colors
  textPrimary: '#1a1a1a',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#ffffff',
  
  // Border and Divider
  border: '#e0e0e0',
  borderLight: '#f0f0f0',
  divider: '#d0d0d0',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',
  
  // Disabled
  disabled: '#cccccc',
  disabledBg: '#f5f5f5',
};

/**
 * Dark Mode Colors
 */
export const darkModeColors = {
  primary: '#6a96f7',
  primaryLight: '#8ab2f9',
  primaryDark: '#4a80f5',
  
  secondary: '#a78bfa',
  secondaryLight: '#c4b5fd',
  secondaryDark: '#8b5cf6',
  
  success: '#6af570',
  successLight: '#86efac',
  successDark: '#22c55e',
  
  error: '#f76a6a',
  errorLight: '#fca5a5',
  errorDark: '#ef4444',
  
  warning: '#f7b66a',
  warningLight: '#fcd34d',
  warningDark: '#f59e0b',
  
  info: '#6af5f5',
  infoLight: '#a5f3fc',
  infoDark: '#06b6d4',
  
  background: '#1a1a1a',
  backgroundAlt: '#2d2d2d',
  surface: '#242424',
  surfaceVariant: '#3a3a3a',
  
  textPrimary: '#ffffff',
  textSecondary: '#cccccc',
  textTertiary: '#999999',
  textInverse: '#1a1a1a',
  
  border: '#3a3a3a',
  borderLight: '#2d2d2d',
  divider: '#4a4a4a',
  
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
  
  disabled: '#555555',
  disabledBg: '#2d2d2d',
};

/**
 * Typography Configuration
 */
export const typography = {
  fontFamily: {
    base: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
    heading: "'Poppins', 'Inter', sans-serif",
    mono: "'Menlo', 'Monaco', 'Courier New', monospace",
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

/**
 * Spacing Configuration
 */
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};

/**
 * Border Radius Configuration
 */
export const borderRadius = {
  none: '0',
  sm: '4px',
  base: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  full: '9999px',
};

/**
 * Shadow Configuration
 */
export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px rgba(0, 0, 0, 0.15)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
};

/**
 * AppKit Theme Variables
 */
export interface AppKitThemeVariables {
  // Colors
  '--w3m-accent': string;
  '--w3m-color-mix': string;
  '--w3m-color-mix-strength': number;
  
  // Font
  '--w3m-font-family': string;
  
  // Spacing & Sizing
  '--w3m-border-radius-master': string;
  '--w3m-z-index': number;
  '--w3m-modal-max-width': string;
  '--w3m-modal-padding': string;
  
  // Buttons
  '--w3m-button-font-size': string;
  '--w3m-button-padding': string;
  '--w3m-button-border-radius': string;
  
  // Input
  '--w3m-input-font-size': string;
  '--w3m-input-padding': string;
  '--w3m-input-border-radius': string;
  
  // Text
  '--w3m-text-small-size': string;
  '--w3m-text-small-weight': number;
  
  // Overlay
  '--w3m-overlay-background': string;
  '--w3m-overlay-backdrop-filter': string;
}

/**
 * Get theme variables for light mode
 */
export const getLightThemeVariables = (): AppKitThemeVariables => ({
  // Colors
  '--w3m-accent': renvaultColors.primary,
  '--w3m-color-mix': renvaultColors.backgroundAlt,
  '--w3m-color-mix-strength': 10,
  
  // Font
  '--w3m-font-family': typography.fontFamily.base,
  
  // Spacing & Sizing
  '--w3m-border-radius-master': borderRadius.base,
  '--w3m-z-index': 9999,
  '--w3m-modal-max-width': '600px',
  '--w3m-modal-padding': spacing.lg,
  
  // Buttons
  '--w3m-button-font-size': typography.fontSize.base,
  '--w3m-button-padding': `${spacing.sm} ${spacing.md}`,
  '--w3m-button-border-radius': borderRadius.base,
  
  // Input
  '--w3m-input-font-size': typography.fontSize.base,
  '--w3m-input-padding': `${spacing.sm} ${spacing.md}`,
  '--w3m-input-border-radius': borderRadius.sm,
  
  // Text
  '--w3m-text-small-size': typography.fontSize.sm,
  '--w3m-text-small-weight': typography.fontWeight.normal,
  
  // Overlay
  '--w3m-overlay-background': renvaultColors.overlay,
  '--w3m-overlay-backdrop-filter': 'blur(4px)',
});

/**
 * Get theme variables for dark mode
 */
export const getDarkThemeVariables = (): AppKitThemeVariables => ({
  // Colors
  '--w3m-accent': darkModeColors.primary,
  '--w3m-color-mix': darkModeColors.backgroundAlt,
  '--w3m-color-mix-strength': 20,
  
  // Font
  '--w3m-font-family': typography.fontFamily.base,
  
  // Spacing & Sizing
  '--w3m-border-radius-master': borderRadius.base,
  '--w3m-z-index': 9999,
  '--w3m-modal-max-width': '600px',
  '--w3m-modal-padding': spacing.lg,
  
  // Buttons
  '--w3m-button-font-size': typography.fontSize.base,
  '--w3m-button-padding': `${spacing.sm} ${spacing.md}`,
  '--w3m-button-border-radius': borderRadius.base,
  
  // Input
  '--w3m-input-font-size': typography.fontSize.base,
  '--w3m-input-padding': `${spacing.sm} ${spacing.md}`,
  '--w3m-input-border-radius': borderRadius.sm,
  
  // Text
  '--w3m-text-small-size': typography.fontSize.sm,
  '--w3m-text-small-weight': typography.fontWeight.normal,
  
  // Overlay
  '--w3m-overlay-background': darkModeColors.overlay,
  '--w3m-overlay-backdrop-filter': 'blur(4px)',
});

/**
 * AppKit Theme Configuration
 */
export interface AppKitThemeConfig {
  themeMode: ThemeMode;
  themeVariables: AppKitThemeVariables;
  w3mLogoUrl?: string;
}

/**
 * Get AppKit theme configuration
 */
export const getAppKitThemeConfig = (mode: ThemeMode = 'light'): AppKitThemeConfig => {
  return {
    themeMode: mode,
    themeVariables: mode === 'light' ? getLightThemeVariables() : getDarkThemeVariables(),
    w3mLogoUrl: '/logo.svg',
  };
};

/**
 * CSS Variables for dynamic theming
 */
export const getCSSVariables = (mode: ThemeMode = 'light') => {
  const colors = mode === 'light' ? renvaultColors : darkModeColors;
  
  return {
    // Primary
    '--color-primary': colors.primary,
    '--color-primary-light': colors.primaryLight,
    '--color-primary-dark': colors.primaryDark,
    
    // Status
    '--color-success': colors.success,
    '--color-error': colors.error,
    '--color-warning': colors.warning,
    '--color-info': colors.info,
    
    // Neutral
    '--color-bg': colors.background,
    '--color-bg-alt': colors.backgroundAlt,
    '--color-surface': colors.surface,
    '--color-surface-variant': colors.surfaceVariant,
    
    // Text
    '--color-text-primary': colors.textPrimary,
    '--color-text-secondary': colors.textSecondary,
    '--color-text-tertiary': colors.textTertiary,
    
    // Borders
    '--color-border': colors.border,
    '--color-divider': colors.divider,
    
    // Typography
    '--font-family-base': typography.fontFamily.base,
    '--font-family-heading': typography.fontFamily.heading,
    '--font-family-mono': typography.fontFamily.mono,
    
    // Sizing
    '--border-radius': borderRadius.base,
    '--border-radius-sm': borderRadius.sm,
    '--border-radius-lg': borderRadius.lg,
    
    // Spacing
    '--spacing-xs': spacing.xs,
    '--spacing-sm': spacing.sm,
    '--spacing-md': spacing.md,
    '--spacing-lg': spacing.lg,
    '--spacing-xl': spacing.xl,
  };
};

/**
 * Theme defaults
 */
export const themeDefaults = {
  mode: 'light' as ThemeMode,
  name: 'renvault' as ThemeName,
  enableSystemPreference: true,
  persistToLocalStorage: true,
  storageKey: 'renvault_theme_preference',
};
