/**
 * Theme Integration Examples
 * Practical examples for integrating theme system into RenVault
 */

/**
 * Example 1: Integrate Theme into Existing App Component
 * 
 * Usage in your existing App.tsx:
 */
import { useThemeInitialization, updateAllThemeStyles } from '../hooks/useThemeIntegration';
import { useTheme } from '../services/theme/ThemeSwitchService';

export function AppWithTheme() {
  // Initialize theme system
  const { mode } = useThemeInitialization();

  return (
    <div className="app" data-theme={mode}>
      <Header />
      <Content />
      <Footer />
    </div>
  );
}

/**
 * Example 2: Theme Switcher Component
 * 
 * Add to your header or settings
 */
import React from 'react';
import { useTheme } from '../services/theme/ThemeSwitchService';

export function ThemeSwitcher() {
  const { mode, toggleMode, switchMode } = useTheme();

  return (
    <div className="theme-switcher">
      <button
        onClick={toggleMode}
        className="theme-toggle-btn"
        aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
      >
        {mode === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </button>

      <div className="theme-options">
        <button
          onClick={() => switchMode('light')}
          className={`theme-option ${mode === 'light' ? 'active' : ''}`}
        >
          ☀️ Light
        </button>
        <button
          onClick={() => switchMode('dark')}
          className={`theme-option ${mode === 'dark' ? 'active' : ''}`}
        >
          🌙 Dark
        </button>
      </div>
    </div>
  );
}

/**
 * Example 3: Settings Panel with Theme Customization
 */
import { useThemePersistence } from '../services/theme/ThemePersistenceService';

export function ThemeSettingsPanel() {
  const {
    settings,
    setFontFamily,
    setFontSize,
    setAnimations,
    setHighContrast,
    history,
    statistics,
  } = useThemePersistence();

  return (
    <div className="theme-settings">
      <h2>Theme Settings</h2>

      {/* Font Family */}
      <div className="setting-group">
        <label>Font Family</label>
        <select
          value={settings.fontFamily}
          onChange={(e) => setFontFamily(e.target.value as 'inter' | 'poppins' | 'system')}
        >
          <option value="inter">Inter (Default)</option>
          <option value="poppins">Poppins</option>
          <option value="system">System Font</option>
        </select>
      </div>

      {/* Font Size */}
      <div className="setting-group">
        <label>Font Size</label>
        <select
          value={settings.fontSize}
          onChange={(e) => setFontSize(e.target.value as 'sm' | 'base' | 'lg')}
        >
          <option value="sm">Small</option>
          <option value="base">Base (Default)</option>
          <option value="lg">Large</option>
        </select>
      </div>

      {/* Animations Toggle */}
      <div className="setting-group">
        <label>
          <input
            type="checkbox"
            checked={settings.animations}
            onChange={(e) => setAnimations(e.target.checked)}
          />
          Enable Animations
        </label>
      </div>

      {/* High Contrast Toggle */}
      <div className="setting-group">
        <label>
          <input
            type="checkbox"
            checked={settings.highContrast}
            onChange={(e) => setHighContrast(e.target.checked)}
          />
          High Contrast Mode
        </label>
      </div>

      {/* Statistics */}
      <div className="statistics">
        <h3>Theme Usage</h3>
        <p>Light Mode: {statistics.lightCount} times</p>
        <p>Dark Mode: {statistics.darkCount} times</p>
      </div>
    </div>
  );
}

/**
 * Example 4: WalletConnect Modal with Custom Theme
 */
import { AppKit } from '@reown/appkit/react';
import { ThemeSwitchService } from '../services/theme/ThemeSwitchService';

export function WalletConnectWithTheme() {
  const config = ThemeSwitchService.getAppKitConfig();

  return (
    <AppKit
      projectId={process.env.REACT_APP_PROJECT_ID}
      chains={[/* your chains */]}
      config={{
        ...config,
        termsConditionsUrl: 'https://renvault.io/terms',
        privacyPolicyUrl: 'https://renvault.io/privacy',
      }}
    >
      {/* Your wallet components */}
    </AppKit>
  );
}

/**
 * Example 5: Custom Color Palette Generator
 */
import { createCustomTheme } from '../utils/themeUtils';

export function CustomPaletteGenerator() {
  const [primaryColor, setPrimaryColor] = React.useState('#4a80f5');
  const [generatedTheme, setGeneratedTheme] = React.useState(null);

  const handleGenerateTheme = () => {
    const theme = createCustomTheme({
      primaryColor,
      backgroundColor: '#ffffff',
      textColor: '#1a1a1a',
    });
    setGeneratedTheme(theme);
  };

  return (
    <div className="palette-generator">
      <h2>Generate Custom Theme</h2>

      <div className="color-picker">
        <label>Primary Color</label>
        <input
          type="color"
          value={primaryColor}
          onChange={(e) => setPrimaryColor(e.target.value)}
        />
      </div>

      <button onClick={handleGenerateTheme}>Generate Theme</button>

      {generatedTheme && (
        <div className="generated-theme">
          <h3>Generated Theme</h3>
          <pre>{JSON.stringify(generatedTheme, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

/**
 * Example 6: Accessibility Checker Component
 */
import { ThemeValidator, ThemeAccessibilityChecker } from '../validators/themeValidator';

export function AccessibilityChecker({ themeConfig }) {
  const [validationResult, setValidationResult] = React.useState(null);
  const [wcagCompliance, setWcagCompliance] = React.useState(null);

  React.useEffect(() => {
    // Validate theme
    const validation = ThemeValidator.validateTheme(themeConfig);
    setValidationResult(validation);

    // Check WCAG compliance
    const wcag = ThemeAccessibilityChecker.checkWCAGCompliance(themeConfig);
    setWcagCompliance(wcag);
  }, [themeConfig]);

  return (
    <div className="accessibility-checker">
      <h2>Theme Accessibility Check</h2>

      {validationResult && (
        <div className={`validation ${validationResult.valid ? 'valid' : 'invalid'}`}>
          {validationResult.valid ? '✅ Valid' : '❌ Invalid'}
          {validationResult.errors.length > 0 && (
            <ul>
              {validationResult.errors.map((error) => (
                <li key={error.field}>{error.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {wcagCompliance && (
        <div className={`wcag ${wcagCompliance.compliant ? 'compliant' : 'non-compliant'}`}>
          <h3>WCAG Compliance</h3>
          <p>{wcagCompliance.compliant ? '✅ Compliant' : '❌ Non-Compliant'}</p>
          {wcagCompliance.issues.length > 0 && (
            <ul>
              {wcagCompliance.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Example 7: Theme Export/Import
 */
import { ThemePersistenceService } from '../services/theme/ThemePersistenceService';

export function ThemePortability() {
  const handleExport = () => {
    const exported = ThemePersistenceService.exportPreferences();
    const blob = new Blob([exported], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'renvault-theme-preferences.json';
    a.click();
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      const success = ThemePersistenceService.importPreferences(json);
      if (success) {
        alert('Theme preferences imported successfully');
      } else {
        alert('Failed to import theme preferences');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="theme-portability">
      <h2>Theme Preferences</h2>

      <button onClick={handleExport}>📥 Export Preferences</button>

      <label>
        📤 Import Preferences:
        <input
          type="file"
          accept=".json"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleImport(e.target.files[0]);
            }
          }}
        />
      </label>
    </div>
  );
}

/**
 * Example 8: Real-time Theme Preview
 */
export function ThemePreviewLive() {
  const { mode } = useTheme();

  return (
    <div className="theme-preview-live" data-theme={mode}>
      <div className="preview-header">
        <div className="preview-item">
          <span className="label">Primary Color</span>
          <div className="color-box" style={{ backgroundColor: 'var(--color-primary)' }} />
        </div>
        <div className="preview-item">
          <span className="label">Background</span>
          <div className="color-box" style={{ backgroundColor: 'var(--color-background)' }} />
        </div>
        <div className="preview-item">
          <span className="label">Text</span>
          <div className="color-box" style={{ backgroundColor: 'var(--color-text)' }} />
        </div>
      </div>

      <div className="preview-content">
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <p>This is body text. It uses the configured typography settings.</p>

        <div className="button-preview">
          <button className="btn-primary">Primary Button</button>
          <button className="btn-secondary">Secondary Button</button>
          <button className="btn-success">Success Button</button>
          <button className="btn-error">Error Button</button>
        </div>
      </div>
    </div>
  );
}

/**
 * Example 9: Keyboard Shortcuts for Theme
 */
export function ThemeKeyboardShortcuts() {
  const { toggleMode } = useTheme();

  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + T for theme toggle
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
        event.preventDefault();
        toggleMode();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleMode]);

  return null; // Hook component, no render
}

/**
 * Example 10: Theme Initialization in main.tsx
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeSwitchService } from './services/theme/ThemeSwitchService';
import { injectThemeStyles } from './hooks/useThemeIntegration';

// Initialize theme before rendering
ThemeSwitchService.initialize();
injectThemeStyles();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

export default AppWithTheme;
