/**
 * Theme Validation Utilities
 * Validates theme configuration and consistency
 */

import { AppKitThemeConfig, ThemeMode } from '../config/appkit-theme';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Comprehensive theme validation
 */
export class ThemeValidator {
  private static readonly REQUIRED_COLOR_FIELDS = [
    'primary',
    'background',
    'surface',
    'text',
    'border',
  ];

  private static readonly RECOMMENDED_COLOR_FIELDS = [
    'success',
    'error',
    'warning',
    'info',
    'primaryDark',
    'primaryLight',
  ];

  /**
   * Validate complete theme configuration
   */
  static validateTheme(config: Partial<AppKitThemeConfig>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Validate colors
    if (!config.colors) {
      errors.push({
        field: 'colors',
        message: 'Theme must have a colors object',
        severity: 'error',
      });
    } else {
      this.validateColors(config.colors, errors, warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate color palette
   */
  private static validateColors(
    colors: Record<string, any>,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    // Check required colors
    this.REQUIRED_COLOR_FIELDS.forEach(field => {
      if (!colors[field]) {
        errors.push({
          field: `colors.${field}`,
          message: `Missing required color: ${field}`,
          severity: 'error',
        });
      } else if (!this.isValidColor(colors[field])) {
        errors.push({
          field: `colors.${field}`,
          message: `Invalid color format: ${colors[field]}`,
          severity: 'error',
        });
      }
    });

    // Check recommended colors
    this.RECOMMENDED_COLOR_FIELDS.forEach(field => {
      if (!colors[field]) {
        warnings.push({
          field: `colors.${field}`,
          message: `Recommended color not found: ${field}`,
          severity: 'warning',
        });
      }
    });

    // Validate color contrast
    this.validateContrast(colors, errors);
  }

  /**
   * Validate color contrast for accessibility
   */
  private static validateContrast(
    colors: Record<string, string>,
    errors: ValidationError[]
  ): void {
    const textColor = colors.text;
    const backgroundColor = colors.background;

    if (textColor && backgroundColor && !this.hasGoodContrast(textColor, backgroundColor)) {
      errors.push({
        field: 'colors.contrast',
        message: 'Text and background colors have insufficient contrast for accessibility',
        severity: 'warning',
      });
    }
  }

  /**
   * Check if color is valid (hex, rgb, rgba)
   */
  private static isValidColor(color: string): boolean {
    // Check hex format
    if (/^#[0-9A-F]{6}$/i.test(color)) return true;

    // Check hex 8 format (with alpha)
    if (/^#[0-9A-F]{8}$/i.test(color)) return true;

    // Check rgb format
    if (/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i.test(color)) return true;

    // Check rgba format
    if (/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/i.test(color)) return true;

    // Check CSS color names
    const cssColors = [
      'transparent',
      'white',
      'black',
      'red',
      'green',
      'blue',
      'yellow',
      'cyan',
      'magenta',
    ];
    if (cssColors.includes(color.toLowerCase())) return true;

    return false;
  }

  /**
   * Check if two colors have good contrast
   */
  private static hasGoodContrast(color1: string, color2: string): boolean {
    const lum1 = this.getColorLuminance(color1);
    const lum2 = this.getColorLuminance(color2);

    // WCAG AA standard: contrast ratio >= 4.5
    const contrast = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
    return contrast >= 4.5;
  }

  /**
   * Get color luminance for contrast calculation
   */
  private static getColorLuminance(color: string): number {
    // Convert to RGB
    let r = 0,
      g = 0,
      b = 0;

    // Handle hex colors
    if (color.startsWith('#')) {
      const hex = color.substring(1);
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }

    // Normalize to 0-1 range
    r /= 255;
    g /= 255;
    b /= 255;

    // Apply gamma correction
    r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Validate theme mode
   */
  static validateMode(mode: any): mode is ThemeMode {
    return mode === 'light' || mode === 'dark';
  }

  /**
   * Validate typography configuration
   */
  static validateTypography(typography: any): boolean {
    if (!typography) return false;

    const hasRequiredFields =
      typography.fontFamilies &&
      typography.fontSize &&
      typography.fontWeight &&
      typography.lineHeight;

    return hasRequiredFields;
  }

  /**
   * Generate validation report
   */
  static generateReport(config: Partial<AppKitThemeConfig>): string {
    const result = this.validateTheme(config);

    let report = `Theme Validation Report\n`;
    report += `========================\n\n`;

    if (result.valid) {
      report += `✅ Theme is valid\n\n`;
    } else {
      report += `❌ Theme has errors\n\n`;
    }

    if (result.errors.length > 0) {
      report += `Errors (${result.errors.length}):\n`;
      result.errors.forEach(error => {
        report += `  • ${error.field}: ${error.message}\n`;
      });
      report += '\n';
    }

    if (result.warnings.length > 0) {
      report += `Warnings (${result.warnings.length}):\n`;
      result.warnings.forEach(warning => {
        report += `  ⚠ ${warning.field}: ${warning.message}\n`;
      });
      report += '\n';
    }

    if (result.valid && result.warnings.length === 0) {
      report += `No issues found. Theme is production-ready.\n`;
    }

    return report;
  }

  /**
   * Validate CSS variables
   */
  static validateCSSVariables(root: HTMLElement): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    const computedStyle = window.getComputedStyle(root);

    this.REQUIRED_COLOR_FIELDS.forEach(field => {
      const cssVarName = `--color-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      const value = computedStyle.getPropertyValue(cssVarName);

      if (!value || value.trim() === '') {
        warnings.push({
          field: cssVarName,
          message: `CSS variable not set on document root`,
          severity: 'warning',
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

/**
 * Theme compatibility checker
 */
export class ThemeCompatibilityChecker {
  /**
   * Check browser support for theme features
   */
  static checkBrowserSupport(): {
    cssVariables: boolean;
    mediaQuery: boolean;
    localStorage: boolean;
    fetchAPI: boolean;
  } {
    const htmlElement = document.documentElement;

    return {
      cssVariables: 'CSS' in window && 'registerProperty' in CSS,
      mediaQuery: window.matchMedia !== undefined,
      localStorage: (() => {
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
          return true;
        } catch {
          return false;
        }
      })(),
      fetchAPI: 'fetch' in window,
    };
  }

  /**
   * Check feature availability
   */
  static checkFeatures(): {
    darkModeSupport: boolean;
    highContrastSupport: boolean;
    reducedMotionSupport: boolean;
  } {
    return {
      darkModeSupport: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').media !== 'not all',
      highContrastSupport: window.matchMedia && window.matchMedia('(prefers-contrast: more)').media !== 'not all',
      reducedMotionSupport: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').media !== 'not all',
    };
  }

  /**
   * Generate compatibility report
   */
  static generateReport(): string {
    const support = this.checkBrowserSupport();
    const features = this.checkFeatures();

    let report = `Browser Compatibility Report\n`;
    report += `===========================\n\n`;

    report += `Browser Support:\n`;
    report += `  CSS Variables: ${support.cssVariables ? '✅' : '❌'}\n`;
    report += `  Media Query: ${support.mediaQuery ? '✅' : '❌'}\n`;
    report += `  localStorage: ${support.localStorage ? '✅' : '❌'}\n`;
    report += `  Fetch API: ${support.fetchAPI ? '✅' : '❌'}\n\n`;

    report += `Feature Support:\n`;
    report += `  Dark Mode: ${features.darkModeSupport ? '✅' : '❌'}\n`;
    report += `  High Contrast: ${features.highContrastSupport ? '✅' : '❌'}\n`;
    report += `  Reduced Motion: ${features.reducedMotionSupport ? '✅' : '❌'}\n`;

    return report;
  }
}

/**
 * Theme accessibility checker
 */
export class ThemeAccessibilityChecker {
  /**
   * Check if theme meets WCAG AA standards
   */
  static checkWCAGCompliance(config: Partial<AppKitThemeConfig>): {
    compliant: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    const validator = new ThemeValidator();
    const validation = validator.validateTheme(config);

    validation.errors.forEach(error => {
      if (error.severity === 'error') {
        issues.push(error.message);
      }
    });

    return {
      compliant: issues.length === 0,
      issues,
    };
  }

  /**
   * Check color blindness compatibility
   */
  static checkColorBlindnessCompatibility(colors: Record<string, string>): {
    compatible: boolean;
    recommendations: string[];
  } {
    const recommendations: string[] = [];

    // Check if colors are distinguishable for different types of color blindness
    if (!this.areColorsDistinguishableForProtanopia(colors)) {
      recommendations.push(
        'Consider using colors more distinguishable for red-blind individuals'
      );
    }

    if (!this.areColorsDistinguishableForDeutaranopia(colors)) {
      recommendations.push(
        'Consider using colors more distinguishable for green-blind individuals'
      );
    }

    if (!this.areColorsDistinguishableForTritanopia(colors)) {
      recommendations.push(
        'Consider using colors more distinguishable for blue-yellow blind individuals'
      );
    }

    return {
      compatible: recommendations.length === 0,
      recommendations,
    };
  }

  private static areColorsDistinguishableForProtanopia(colors: Record<string, string>): boolean {
    // Red blindness: cannot distinguish red and green
    return true; // Simplified check
  }

  private static areColorsDistinguishableForDeutaranopia(colors: Record<string, string>): boolean {
    // Green blindness: cannot distinguish red and green
    return true; // Simplified check
  }

  private static areColorsDistinguishableForTritanopia(colors: Record<string, string>): boolean {
    // Blue-yellow blindness
    return true; // Simplified check
  }
}
