# RenVault AppKit Theme Customization

## Overview

This document covers the comprehensive AppKit theme customization system for RenVault. The theme system provides full control over the visual appearance of AppKit modals and components while maintaining brand consistency.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Services](#services)
- [Utilities](#utilities)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Features

- 🎨 **Complete Theme Control**: Light and dark mode support with full customization
- 🔄 **Theme Switching**: Seamless switching between themes with system preference detection
- 💾 **Persistence**: Automatic saving of theme preferences to localStorage
- 🎯 **RenVault Branding**: Pre-configured colors matching RenVault brand guidelines
- ♿ **Accessibility**: WCAG AA compliant with high contrast support
- 📱 **Responsive**: Adaptive layouts for mobile, tablet, and desktop
- 🎭 **Animation Control**: Customizable animations with reduced motion support
- 📚 **Typography**: Comprehensive font management with multiple font families
- 🧪 **Testing**: Complete test coverage with theme preview components
- ✅ **Validation**: Theme configuration validation and compatibility checking

## Architecture

### Core Components

```
frontend/src/
├── config/
│   └── appkit-theme.ts              # Theme configuration and design tokens
├── services/
│   └── theme/
│       ├── ThemeSwitchService.ts    # Theme switching logic
│       ├── ThemePersistenceService.ts # localStorage management
│       ├── TypographyService.ts     # Font management
│       └── LogoService.ts           # Logo handling
├── styles/
│   ├── modalStyles.ts               # Modal customization
│   ├── buttonStyles.ts              # Button styling
│   └── responsiveTheme.ts           # Responsive design
├── utils/
│   └── themeUtils.ts                # Helper functions
├── validators/
│   └── themeValidator.ts            # Validation utilities
├── hooks/
│   └── useThemeIntegration.ts       # React hooks
├── components/
│   └── theme/
│       └── ThemePreview.tsx         # Preview component
└── __tests__/
    └── theme.test.ts                # Test suite
```

## Quick Start

### 1. Initialize Theme System

```typescript
import { ThemeSwitchService } from './services/theme/ThemeSwitchService';
import { useThemeInitialization } from './hooks/useThemeIntegration';

// In your App component
function App() {
  const { mode } = useThemeInitialization();

  return (
    <div data-theme={mode}>
      {/* Your app content */}
    </div>
  );
}
```

### 2. Use Theme Hook

```typescript
import { useTheme } from './services/theme/ThemeSwitchService';

function MyComponent() {
  const { mode, toggleMode, switchMode } = useTheme();

  return (
    <div>
      <p>Current mode: {mode}</p>
      <button onClick={toggleMode}>Toggle Theme</button>
      <button onClick={() => switchMode('dark')}>Dark Mode</button>
    </div>
  );
}
```

### 3. Access Theme Config

```typescript
import { ThemeSwitchService } from './services/theme/ThemeSwitchService';

const config = ThemeSwitchService.getAppKitConfig();
console.log(config.colors); // Access theme colors
```

## Configuration

### Theme Configuration File

The main theme configuration is in `frontend/src/config/appkit-theme.ts`:

```typescript
// Light mode colors
export const renvaultColors = {
  primary: '#4a80f5',
  background: '#ffffff',
  surface: '#f7fafc',
  text: '#1a1a1a',
  // ... more colors
};

// Dark mode colors
export const darkModeColors = {
  primary: '#6a96f7',
  background: '#1a1a1a',
  surface: '#2d2d2d',
  text: '#ffffff',
  // ... more colors
};
```

### Customizing Theme

```typescript
import { generateThemeFromPalette } from './utils/themeUtils';

// Generate theme from primary color
const customTheme = generateThemeFromPalette('#your-color');

// Or create custom theme
const customTheme = createCustomTheme({
  primaryColor: '#4a80f5',
  secondaryColor: '#f54a4a',
  backgroundColor: '#ffffff',
  textColor: '#1a1a1a',
  successColor: '#4af55a',
  errorColor: '#f54a4a',
  warningColor: '#f5a54a',
  infoColor: '#4a80f5',
});
```

## Services

### ThemeSwitchService

Manages theme switching and state:

```typescript
// Initialize
ThemeSwitchService.initialize();

// Get current mode
const mode = ThemeSwitchService.getCurrentMode();

// Switch theme
ThemeSwitchService.switchMode('dark');

// Toggle theme
ThemeSwitchService.toggleMode();

// Listen to changes
const unsubscribe = ThemeSwitchService.onThemeChange((mode) => {
  console.log('Theme changed to:', mode);
});

// Get AppKit config
const config = ThemeSwitchService.getAppKitConfig();
```

### ThemePersistenceService

Manages localStorage persistence:

```typescript
// Save preference
ThemePersistenceService.savePreference({ mode: 'dark' });

// Load preference
const preference = ThemePersistenceService.loadPreference();

// Get current settings
const settings = ThemePersistenceService.getSettings();

// Set font family
ThemePersistenceService.setFontFamily('poppins');

// Set font size
ThemePersistenceService.setFontSize('lg');

// Export preferences
const json = ThemePersistenceService.exportPreferences();

// Import preferences
ThemePersistenceService.importPreferences(json);

// Clear all data
ThemePersistenceService.clearAll();
```

### TypographyService

Manages fonts and typography:

```typescript
// Load fonts
await TypographyService.loadFonts({
  preload: true,
  display: 'swap',
  timeout: 5000,
});

// Get typography
const typography = TypographyService.getTypography('fontFamilies');

// Get font size
const size = TypographyService.getFontSize('lg');

// Create typography object
const styles = TypographyService.getTypographyObject('base', 'normal');

// Create heading typography
const heading = TypographyService.createHeadingTypography(1);
```

### LogoService

Manages logo assets:

```typescript
// Get logo for theme
const url = LogoService.getLogoForTheme('light');

// Create logo element
const img = LogoService.createLogoElement('light');

// Set custom logo
LogoService.setLogoUrl('/custom-logo.svg', '/custom-logo-dark.svg');

// Preload logos
await LogoService.preloadAllLogos();

// Inject into modal
LogoService.injectLogoIntoModal(modalElement, 'light', 'header');
```

## Utilities

### Color Utilities

```typescript
import {
  hexToRgb,
  rgbToHex,
  adjustBrightness,
  blendColors,
  getContrastingColor,
} from './utils/themeUtils';

// Convert colors
const rgb = hexToRgb('#4a80f5'); // { r: 74, g: 128, b: 245 }
const hex = rgbToHex(74, 128, 245); // '#4a80f5'

// Adjust brightness
const brighter = adjustBrightness('#4a80f5', 20); // 20% brighter
const darker = adjustBrightness('#4a80f5', -20); // 20% darker

// Blend colors
const blended = blendColors('#4a80f5', '#ffffff', 0.5);

// Get contrasting color
const contrast = getContrastingColor('#ffffff'); // '#000000'
```

### Validation Utilities

```typescript
import { ThemeValidator } from './validators/themeValidator';

// Validate theme
const result = ThemeValidator.validateTheme(config);

// Generate report
const report = ThemeValidator.generateReport(config);
console.log(report);

// Check WCAG compliance
const { compliant, issues } = ThemeValidator.checkWCAGCompliance(config);

// Validate CSS variables
const cssResult = ThemeValidator.validateCSSVariables(document.documentElement);
```

## Usage Examples

### Example 1: Theme Toggle Button

```typescript
function ThemeToggle() {
  const { mode, toggleMode } = useTheme();

  return (
    <button onClick={toggleMode}>
      {mode === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

### Example 2: Custom Theme Component

```typescript
function CustomThemeSettings() {
  const {
    fontFamily,
    fontSize,
    setFontFamily,
    setFontSize,
  } = useThemeCustomization();

  return (
    <div>
      <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
        <option value="inter">Inter</option>
        <option value="poppins">Poppins</option>
        <option value="system">System</option>
      </select>

      <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
        <option value="sm">Small</option>
        <option value="base">Base</option>
        <option value="lg">Large</option>
      </select>
    </div>
  );
}
```

### Example 3: Theme Preview

```typescript
import { ThemePreview } from './components/theme/ThemePreview';

function Settings() {
  return (
    <div>
      <ThemePreview
        onThemeChange={(mode) => console.log('Theme changed to:', mode)}
        showPersistenceControls={true}
        showStatistics={true}
      />
    </div>
  );
}
```

## API Reference

### ThemeSwitchService

- `initialize()`: Initialize theme system
- `getCurrentMode()`: Get current theme mode
- `switchMode(mode)`: Switch to specific mode
- `toggleMode()`: Toggle between modes
- `onThemeChange(listener)`: Subscribe to theme changes
- `getAppKitConfig()`: Get current AppKit config
- `getState()`: Get current theme state
- `resetToSystemPreference()`: Reset to system preference
- `destroy()`: Cleanup

### ThemePersistenceService

- `savePreference(preference)`: Save theme preference
- `loadPreference()`: Load saved preference
- `getMode()`: Get saved mode
- `getSettings()`: Get all settings
- `setFontFamily(family)`: Set font family
- `setFontSize(size)`: Set font size
- `setAnimations(enabled)`: Toggle animations
- `setHighContrast(enabled)`: Toggle high contrast
- `loadHistory()`: Load theme history
- `getStatistics()`: Get usage statistics
- `exportPreferences()`: Export as JSON
- `importPreferences(json)`: Import from JSON
- `clearAll()`: Clear all data

### TypographyService

- `loadFonts(options)`: Load fonts
- `getTypography(key)`: Get typography value
- `getFontFamily(family)`: Get font family
- `getFontSize(size)`: Get font size
- `getFontWeight(weight)`: Get font weight
- `getLineHeight(height)`: Get line height
- `getTypographyObject(size, weight)`: Get typography object
- `createHeadingTypography(level)`: Create heading typography
- `areFontsLoaded()`: Check if fonts loaded
- `getLoadStatus()`: Get load status

## Best Practices

1. **Initialize Early**: Call `ThemeSwitchService.initialize()` in your App component
2. **Use Hooks**: Use the provided React hooks instead of direct service calls
3. **Respect Preferences**: Honor system and user preferences
4. **Validate Configuration**: Always validate theme config before applying
5. **Test Accessibility**: Test color contrast and readability
6. **Provide Fallbacks**: Ensure graceful degradation for unsupported browsers
7. **Persistent Settings**: Leverage localStorage for consistent user experience
8. **Clear Documentation**: Document any custom theme extensions

## Troubleshooting

### Theme Not Applying

```typescript
// Check if ThemeSwitchService is initialized
if (!ThemeSwitchService.getCurrentMode()) {
  ThemeSwitchService.initialize();
}

// Check CSS variables are applied
const root = document.documentElement;
const color = root.style.getPropertyValue('--color-primary');
console.log('Primary color:', color);
```

### localStorage Not Available

```typescript
// Check storage availability
const available = ThemePersistenceService.isStorageAvailable();
if (!available) {
  console.warn('localStorage not available, using session memory');
}
```

### Fonts Not Loading

```typescript
// Check font load status
const status = TypographyService.getLoadStatus();
console.log('Fonts loaded:', status.loaded);

// Try loading again with longer timeout
await TypographyService.loadFonts({ timeout: 10000 });
```

### AppKit Theme Not Updating

```typescript
// Force AppKit update
const config = ThemeSwitchService.getAppKitConfig();
console.log('AppKit config:', config);

// Dispatch custom event
window.dispatchEvent(
  new CustomEvent('appkit-theme-change', {
    detail: { config, mode: 'dark' },
  })
);
```

## Browser Support

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- Mobile browsers: Latest versions

Required features:
- CSS Custom Properties (CSS Variables)
- CSS Grid
- Fetch API
- localStorage (optional, for persistence)
- matchMedia (optional, for system preference detection)

## Performance Considerations

- Theme initialization is lazy-loaded
- CSS variables are cached after first load
- localStorage operations are async to prevent blocking
- Font preloading happens in parallel
- No runtime style recalculation unless necessary

## Security

- All color values are validated
- No arbitrary code execution in theme config
- localStorage data is isolated per domain
- CSS variables are scoped to document

## Contributing

When adding new theme features:

1. Add configuration to `appkit-theme.ts`
2. Create corresponding service if needed
3. Add utility functions to `themeUtils.ts`
4. Add validation rules to `themeValidator.ts`
5. Add tests to `__tests__/theme.test.ts`
6. Update this documentation

## License

Same as RenVault project license.
