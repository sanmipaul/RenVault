/**
 * Theme System Tests
 * Comprehensive testing for theme customization
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ThemeSwitchService } from '../services/theme/ThemeSwitchService';
import { ThemePersistenceService } from '../services/theme/ThemePersistenceService';
import { TypographyService } from '../services/theme/TypographyService';
import { LogoService } from '../services/theme/LogoService';
import {
  hexToRgb,
  rgbToHex,
  adjustBrightness,
  blendColors,
  validateThemeConfig,
  generateThemeFromPalette,
  getContrastingColor,
} from '../utils/themeUtils';
import { renvaultColors, darkModeColors } from '../config/appkit-theme';

describe('ThemeSwitchService', () => {
  beforeEach(() => {
    // Clear any existing listeners
    ThemeSwitchService.destroy();
  });

  it('should initialize with default mode', () => {
    ThemeSwitchService.initialize();
    expect(ThemeSwitchService.getCurrentMode()).toBeDefined();
  });

  it('should switch between light and dark modes', () => {
    ThemeSwitchService.initialize();
    const initialMode = ThemeSwitchService.getCurrentMode();
    ThemeSwitchService.switchMode(initialMode === 'light' ? 'dark' : 'light');
    expect(ThemeSwitchService.getCurrentMode()).not.toBe(initialMode);
  });

  it('should toggle theme mode', () => {
    ThemeSwitchService.initialize();
    const initialMode = ThemeSwitchService.getCurrentMode();
    ThemeSwitchService.toggleMode();
    expect(ThemeSwitchService.getCurrentMode()).not.toBe(initialMode);
  });

  it('should notify listeners on theme change', () => {
    ThemeSwitchService.initialize();
    let notified = false;
    const unsubscribe = ThemeSwitchService.onThemeChange(() => {
      notified = true;
    });

    ThemeSwitchService.toggleMode();
    expect(notified).toBe(true);

    unsubscribe();
  });

  it('should return correct AppKit config', () => {
    ThemeSwitchService.initialize();
    const config = ThemeSwitchService.getAppKitConfig();
    expect(config).toBeDefined();
    expect(config.colors).toBeDefined();
  });
});

describe('ThemePersistenceService', () => {
  beforeEach(() => {
    ThemePersistenceService.clearAll();
  });

  afterEach(() => {
    ThemePersistenceService.clearAll();
  });

  it('should save and load theme preference', () => {
    const saved = ThemePersistenceService.savePreference({ mode: 'dark' });
    expect(saved).toBe(true);

    const loaded = ThemePersistenceService.loadPreference();
    expect(loaded).toBeDefined();
    expect(loaded?.mode).toBe('dark');
  });

  it('should get current mode', () => {
    ThemePersistenceService.savePreference({ mode: 'light' });
    expect(ThemePersistenceService.getMode()).toBe('light');
  });

  it('should set font family', () => {
    const success = ThemePersistenceService.setFontFamily('poppins');
    expect(success).toBe(true);

    const settings = ThemePersistenceService.getSettings();
    expect(settings.fontFamily).toBe('poppins');
  });

  it('should toggle animations', () => {
    ThemePersistenceService.setAnimations(false);
    let settings = ThemePersistenceService.getSettings();
    expect(settings.animations).toBe(false);

    ThemePersistenceService.setAnimations(true);
    settings = ThemePersistenceService.getSettings();
    expect(settings.animations).toBe(true);
  });

  it('should maintain history', () => {
    ThemePersistenceService.savePreference({ mode: 'light' });
    ThemePersistenceService.savePreference({ mode: 'dark' });

    const history = ThemePersistenceService.loadHistory();
    expect(history.length).toBeGreaterThan(0);
  });

  it('should calculate statistics', () => {
    ThemePersistenceService.savePreference({ mode: 'light' });
    ThemePersistenceService.savePreference({ mode: 'dark' });

    const stats = ThemePersistenceService.getStatistics();
    expect(stats.lightCount).toBeGreaterThan(0);
    expect(stats.darkCount).toBeGreaterThan(0);
  });

  it('should export and import preferences', () => {
    ThemePersistenceService.savePreference({ mode: 'dark', fontSize: 'lg' });

    const exported = ThemePersistenceService.exportPreferences();
    expect(exported).toBeDefined();

    ThemePersistenceService.clearAll();
    const imported = ThemePersistenceService.importPreferences(exported);
    expect(imported).toBe(true);

    const settings = ThemePersistenceService.getSettings();
    expect(settings.mode).toBe('dark');
  });
});

describe('TypographyService', () => {
  it('should get typography value', () => {
    const typography = TypographyService.getTypography('fontFamilies');
    expect(typography).toBeDefined();
    expect(typography.base).toBeDefined();
  });

  it('should get font family', () => {
    const fontFamily = TypographyService.getFontFamily('base');
    expect(fontFamily).toBeDefined();
    expect(typeof fontFamily).toBe('string');
  });

  it('should get font size', () => {
    const fontSize = TypographyService.getFontSize('base');
    expect(fontSize).toBeDefined();
    expect(fontSize).toContain('px');
  });

  it('should get font weight', () => {
    const fontWeight = TypographyService.getFontWeight('bold');
    expect(fontWeight).toBe(700);
  });

  it('should get line height', () => {
    const lineHeight = TypographyService.getLineHeight('normal');
    expect(lineHeight).toBeGreaterThan(0);
  });
});

describe('LogoService', () => {
  it('should get logo for theme', () => {
    const lightLogo = LogoService.getLogoForTheme('light');
    const darkLogo = LogoService.getLogoForTheme('dark');

    expect(lightLogo).toBeDefined();
    expect(darkLogo).toBeDefined();
  });

  it('should create logo element', () => {
    const img = LogoService.createLogoElement('light');
    expect(img).toBeInstanceOf(HTMLImageElement);
    expect(img.alt).toBe('RenVault');
  });

  it('should get logo configuration', () => {
    const config = LogoService.getLogoConfig();
    expect(config).toBeDefined();
    expect(config.width).toBeGreaterThan(0);
    expect(config.height).toBeGreaterThan(0);
  });

  it('should set custom logo URL', () => {
    const customUrl = '/custom-logo.svg';
    LogoService.setLogoUrl(customUrl);

    expect(LogoService.getLogoForTheme('light')).toBe(customUrl);
  });
});

describe('Theme Utilities', () => {
  describe('Color Conversion', () => {
    it('should convert hex to rgb', () => {
      const rgb = hexToRgb('#4a80f5');
      expect(rgb).toBeDefined();
      expect(rgb?.r).toBe(74);
      expect(rgb?.g).toBe(128);
      expect(rgb?.b).toBe(245);
    });

    it('should convert rgb to hex', () => {
      const hex = rgbToHex(74, 128, 245);
      expect(hex).toBe('#4a80f5');
    });

    it('should adjust brightness', () => {
      const brighter = adjustBrightness('#4a80f5', 20);
      const darker = adjustBrightness('#4a80f5', -20);

      expect(brighter).not.toBe('#4a80f5');
      expect(darker).not.toBe('#4a80f5');
      expect(brighter).not.toBe(darker);
    });

    it('should blend colors', () => {
      const blended = blendColors('#4a80f5', '#ffffff', 0.5);
      expect(blended).toBeDefined();
      expect(blended).not.toBe('#4a80f5');
      expect(blended).not.toBe('#ffffff');
    });

    it('should get contrasting color', () => {
      const light = getContrastingColor('#ffffff');
      const dark = getContrastingColor('#000000');

      expect(light).toBe('#000000');
      expect(dark).toBe('#ffffff');
    });
  });

  describe('Theme Validation', () => {
    it('should validate theme configuration', () => {
      const validConfig = {
        colors: {
          primary: '#4a80f5',
          background: '#ffffff',
          surface: '#f7fafc',
          text: '#1a202c',
        },
      };

      const validation = validateThemeConfig(validConfig);
      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it('should detect invalid theme configuration', () => {
      const invalidConfig = {
        colors: {
          primary: '#4a80f5',
          // missing required colors
        },
      };

      const validation = validateThemeConfig(invalidConfig);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Theme Generation', () => {
    it('should generate theme from palette', () => {
      const theme = generateThemeFromPalette('#4a80f5');
      expect(theme).toBeDefined();
      expect(theme.colors).toBeDefined();
      expect(theme.colors?.primary).toBe('#4a80f5');
      expect(theme.colors?.primaryDark).toBeDefined();
      expect(theme.colors?.primaryLight).toBeDefined();
    });
  });
});

describe('Color Palettes', () => {
  it('should have light mode colors', () => {
    expect(renvaultColors).toBeDefined();
    expect(renvaultColors.primary).toBe('#4a80f5');
    expect(renvaultColors.background).toBe('#ffffff');
  });

  it('should have dark mode colors', () => {
    expect(darkModeColors).toBeDefined();
    expect(darkModeColors.primary).toBe('#6a96f7');
    expect(darkModeColors.background).toBe('#1a1a1a');
  });

  it('should have all required colors in both modes', () => {
    const requiredColors = ['primary', 'background', 'surface', 'text', 'border'];

    requiredColors.forEach(color => {
      expect(renvaultColors[color as keyof typeof renvaultColors]).toBeDefined();
      expect(darkModeColors[color as keyof typeof darkModeColors]).toBeDefined();
    });
  });
});

describe('Theme Integration', () => {
  it('should apply theme to DOM', () => {
    ThemeSwitchService.initialize();
    ThemeSwitchService.switchMode('dark');

    const htmlElement = document.documentElement;
    expect(htmlElement.getAttribute('data-theme')).toBe('dark');
    expect(htmlElement.classList.contains('dark')).toBe(true);
  });

  it('should persist theme across sessions', () => {
    ThemePersistenceService.savePreference({ mode: 'dark' });

    const loaded = ThemePersistenceService.loadPreference();
    expect(loaded?.mode).toBe('dark');
  });

  it('should respect system preference when no override is set', () => {
    ThemePersistenceService.clearPreference();
    ThemeSwitchService.resetToSystemPreference();

    // Should use system preference
    const currentMode = ThemeSwitchService.getCurrentMode();
    expect(currentMode).toBeDefined();
    expect(['light', 'dark']).toContain(currentMode);
  });
});
