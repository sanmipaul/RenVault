/**
 * Typography Service
 * Manages font loading and typography configuration
 */

import { typography } from '../config/appkit-theme';

export interface FontLoadOptions {
  preload?: boolean;
  display?: 'swap' | 'block' | 'fallback' | 'optional' | 'auto';
  timeout?: number;
}

/**
 * Typography utility class
 */
export class TypographyService {
  private static fontsLoaded: Set<string> = new Set();
  private static fontLoadPromises: Map<string, Promise<void>> = new Map();

  /**
   * Load Google Fonts
   */
  static async loadFonts(options: FontLoadOptions = {}): Promise<void> {
    const { preload = true, display = 'swap', timeout = 5000 } = options;

    try {
      // Load fonts via Google Fonts API
      const fonts = ['Inter:300,400,500,600,700', 'Poppins:500,600,700'];
      const fontLink = this.buildFontLink(fonts, display);

      if (preload) {
        // Preload fonts for faster loading
        const preloadLinks = this.createPreloadLinks(fonts);
        preloadLinks.forEach(link => {
          if (document.head) {
            document.head.appendChild(link);
          }
        });
      }

      // Add font link to document
      if (!document.querySelector(`link[href="${fontLink}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontLink;
        link.crossOrigin = 'anonymous';

        if (document.head) {
          document.head.appendChild(link);
        }
      }

      // Wait for fonts to load with timeout
      await Promise.race([
        this.waitForFontLoad(timeout),
        new Promise<void>(resolve => setTimeout(resolve, timeout)),
      ]);

      this.fontsLoaded.add('google-fonts');
    } catch (error) {
      console.error('Failed to load fonts:', error);
      // Fallback to system fonts
    }
  }

  /**
   * Build Google Fonts link
   */
  private static buildFontLink(fonts: string[], display: string): string {
    const fontParam = fonts.join('&family=');
    return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontParam)}&display=${display}`;
  }

  /**
   * Create preload links for fonts
   */
  private static createPreloadLinks(fonts: string[]): HTMLLinkElement[] {
    const preloadLinks: HTMLLinkElement[] = [];

    fonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = 'https://fonts.googleapis.com';
      link.crossOrigin = 'anonymous';
      preloadLinks.push(link);

      const link2 = document.createElement('link');
      link2.rel = 'preconnect';
      link2.href = 'https://fonts.gstatic.com';
      link2.crossOrigin = 'anonymous';
      preloadLinks.push(link2);
    });

    return preloadLinks;
  }

  /**
   * Wait for fonts to load
   */
  private static waitForFontLoad(timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(resolve).catch(reject);
      } else {
        // Fallback for older browsers
        setTimeout(resolve, timeout);
      }
    });
  }

  /**
   * Get typography value by key
   */
  static getTypography<K extends keyof typeof typography>(
    key: K
  ): typeof typography[K] {
    return typography[key];
  }

  /**
   * Get font family
   */
  static getFontFamily(family: 'base' | 'heading' | 'mono'): string {
    return typography.fontFamilies[family];
  }

  /**
   * Get font size
   */
  static getFontSize(size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'): string {
    return typography.fontSize[size];
  }

  /**
   * Get font weight
   */
  static getFontWeight(weight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold'): number {
    return typography.fontWeight[weight];
  }

  /**
   * Get line height
   */
  static getLineHeight(height: 'tight' | 'normal' | 'relaxed' | 'loose'): number {
    return typography.lineHeight[height];
  }

  /**
   * Create typography class string
   */
  static createClassName(
    size: keyof typeof typography.fontSize,
    weight: keyof typeof typography.fontWeight = 'normal'
  ): string {
    return `font-${size} font-${weight}`;
  }

  /**
   * Get typography object for CSS-in-JS
   */
  static getTypographyObject(
    size: keyof typeof typography.fontSize,
    weight: keyof typeof typography.fontWeight = 'normal'
  ): {
    fontFamily: string;
    fontSize: string;
    fontWeight: number;
    lineHeight: number;
  } {
    return {
      fontFamily: typography.fontFamilies.base,
      fontSize: typography.fontSize[size],
      fontWeight: typography.fontWeight[weight],
      lineHeight: typography.lineHeight.normal,
    };
  }

  /**
   * Create heading typography
   */
  static createHeadingTypography(level: 1 | 2 | 3 | 4 | 5 | 6): {
    fontFamily: string;
    fontSize: string;
    fontWeight: number;
    lineHeight: number;
  } {
    const sizes: Record<number, keyof typeof typography.fontSize> = {
      1: '3xl',
      2: '2xl',
      3: 'xl',
      4: 'lg',
      5: 'base',
      6: 'sm',
    };

    return {
      fontFamily: typography.fontFamilies.heading,
      fontSize: typography.fontSize[sizes[level]],
      fontWeight: typography.fontWeight.bold,
      lineHeight: typography.lineHeight.tight,
    };
  }

  /**
   * Check if fonts are loaded
   */
  static areFontsLoaded(): boolean {
    return this.fontsLoaded.size > 0;
  }

  /**
   * Get load status
   */
  static getLoadStatus(): {
    loaded: boolean;
    fonts: string[];
  } {
    return {
      loaded: this.areFontsLoaded(),
      fonts: Array.from(this.fontsLoaded),
    };
  }
}

/**
 * Apply typography to element
 */
export function applyTypography(
  element: HTMLElement,
  size: keyof typeof typography.fontSize,
  weight: keyof typeof typography.fontWeight = 'normal'
): void {
  const styles = TypographyService.getTypographyObject(size, weight);
  Object.assign(element.style, {
    fontFamily: styles.fontFamily,
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
    lineHeight: styles.lineHeight,
  });
}

/**
 * Create responsive typography CSS
 */
export const responsiveTypography = {
  heading1: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    '@media (max-width: 768px)': {
      fontSize: typography.fontSize.xl,
    },
  },
  heading2: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    '@media (max-width: 768px)': {
      fontSize: typography.fontSize.lg,
    },
  },
  heading3: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.normal,
    '@media (max-width: 768px)': {
      fontSize: typography.fontSize.base,
    },
  },
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.relaxed,
  },
  caption: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.tight,
  },
};
