/**
 * Theme Preview Component
 * Displays and allows testing of theme configurations
 */

import React from 'react';
import { ThemeSwitchService, useTheme } from '../services/theme/ThemeSwitchService';
import { ThemePersistenceService, useThemePersistence } from '../services/theme/ThemePersistenceService';
import { renvaultColors, darkModeColors } from '../config/appkit-theme';

export interface ThemePreviewProps {
  onThemeChange?: (mode: 'light' | 'dark') => void;
  showPersistenceControls?: boolean;
  showStatistics?: boolean;
  compact?: boolean;
}

/**
 * Theme Preview Component
 */
export const ThemePreview: React.FC<ThemePreviewProps> = ({
  onThemeChange,
  showPersistenceControls = true,
  showStatistics = true,
  compact = false,
}) => {
  const { mode, toggleMode, switchMode } = useTheme();
  const { settings, setFontFamily, setFontSize, setAnimations, setHighContrast, statistics } =
    useThemePersistence();

  const handleThemeToggle = () => {
    toggleMode();
    onThemeChange?.(mode === 'light' ? 'dark' : 'light');
  };

  const colors = mode === 'light' ? renvaultColors : darkModeColors;

  return (
    <div
      style={{
        background: colors.background,
        color: colors.text,
        padding: compact ? '12px' : '24px',
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: compact ? '12px' : '20px',
        }}
      >
        <h2 style={{ margin: 0, fontSize: compact ? '14px' : '18px' }}>Theme Preview</h2>
        <button
          onClick={handleThemeToggle}
          style={{
            background: colors.primary,
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          {mode === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>

      {/* Color Preview */}
      <div style={{ marginBottom: compact ? '12px' : '20px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>Colors</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          <ColorSwatch label="Primary" color={colors.primary} />
          <ColorSwatch label="Success" color={colors.success} />
          <ColorSwatch label="Error" color={colors.error} />
          <ColorSwatch label="Warning" color={colors.warning} />
          <ColorSwatch label="Info" color={colors.info} />
          <ColorSwatch label="Text" color={colors.text} />
          <ColorSwatch label="Surface" color={colors.surface} />
          <ColorSwatch label="Border" color={colors.border} />
        </div>
      </div>

      {/* Settings */}
      {showPersistenceControls && (
        <div style={{ marginBottom: compact ? '12px' : '20px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>Settings</h3>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>
              Font Family
            </label>
            <select
              value={settings.fontFamily}
              onChange={e => setFontFamily(e.target.value as 'inter' | 'poppins' | 'system')}
              style={{
                background: colors.surface,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                padding: '6px 8px',
                borderRadius: '4px',
                width: '100%',
                fontSize: '12px',
              }}
            >
              <option value="inter">Inter</option>
              <option value="poppins">Poppins</option>
              <option value="system">System</option>
            </select>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>
              Font Size
            </label>
            <select
              value={settings.fontSize}
              onChange={e => setFontSize(e.target.value as 'sm' | 'base' | 'lg')}
              style={{
                background: colors.surface,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                padding: '6px 8px',
                borderRadius: '4px',
                width: '100%',
                fontSize: '12px',
              }}
            >
              <option value="sm">Small</option>
              <option value="base">Base</option>
              <option value="lg">Large</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="checkbox"
                checked={settings.animations}
                onChange={e => setAnimations(e.target.checked)}
              />
              Animations
            </label>
            <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={e => setHighContrast(e.target.checked)}
              />
              High Contrast
            </label>
          </div>
        </div>
      )}

      {/* Statistics */}
      {showStatistics && (
        <div style={{ paddingTop: compact ? '12px' : '20px', borderTop: `1px solid ${colors.border}` }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>Usage Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12px' }}>
            <StatItem label="Light Mode" value={statistics.lightCount} />
            <StatItem label="Dark Mode" value={statistics.darkCount} />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Color Swatch Component
 */
const ColorSwatch: React.FC<{ label: string; color: string }> = ({ label, color }) => {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          background: color,
          width: '100%',
          height: '40px',
          borderRadius: '6px',
          marginBottom: '6px',
          border: '1px solid rgba(0, 0, 0, 0.1)',
        }}
      />
      <span style={{ fontSize: '11px', display: 'block' }}>{label}</span>
      <code style={{ fontSize: '9px', color: '#999' }}>{color}</code>
    </div>
  );
};

/**
 * Statistics Item Component
 */
const StatItem: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  return (
    <div>
      <div style={{ fontWeight: 600 }}>{value}</div>
      <div style={{ color: '#999' }}>{label}</div>
    </div>
  );
};

/**
 * Comprehensive Theme Test Component
 */
export const ThemeTestSuite: React.FC = () => {
  const { mode } = useTheme();
  const colors = mode === 'light' ? renvaultColors : darkModeColors;

  return (
    <div
      style={{
        background: colors.background,
        color: colors.text,
        padding: '24px',
      }}
    >
      <h1>Theme Test Suite</h1>

      <section style={{ marginBottom: '32px' }}>
        <h2>Buttons</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn-primary">Primary Button</button>
          <button className="btn-secondary">Secondary Button</button>
          <button className="btn-success">Success Button</button>
          <button className="btn-error">Error Button</button>
          <button className="btn-ghost">Ghost Button</button>
          <button className="btn-text">Text Button</button>
        </div>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2>Text Elements</h2>
        <h3>Heading 3</h3>
        <p>
          This is a paragraph with regular text. It should display with the base font size and
          relaxed line height for optimal readability.
        </p>
        <small>Small text for captions and labels</small>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2>Interactive Elements</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" />
            Checkbox
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="radio" name="radio" />
            Radio Button
          </label>
          <div className="toggle" />
        </div>
      </section>

      <section>
        <h2>Cards</h2>
        <div
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <h3 style={{ margin: '0 0 8px 0' }}>Card Title</h3>
          <p style={{ margin: 0, fontSize: '14px', color: colors.textSecondary }}>
            Card content goes here
          </p>
        </div>
      </section>
    </div>
  );
};

export default ThemePreview;
