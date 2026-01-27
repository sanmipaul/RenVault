/**
 * Button and Interactive Elements Styles
 * Comprehensive styling for buttons and interactive components
 */

import { renvaultColors, darkModeColors, borderRadius, shadows } from '../config/appkit-theme';

/**
 * Generate button styles for AppKit
 */
export const generateButtonStyles = (mode: 'light' | 'dark'): string => {
  const colors = mode === 'light' ? renvaultColors : darkModeColors;

  return `
    /* Primary Button */
    .btn-primary,
    .w3m-button-primary {
      background: ${colors.primary};
      color: #ffffff;
      border: none;
      border-radius: ${borderRadius.md};
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-family: 'Inter', sans-serif;
    }

    .btn-primary:hover,
    .w3m-button-primary:hover {
      background: ${colors.primaryDark};
      box-shadow: ${shadows.md};
      transform: translateY(-2px);
    }

    .btn-primary:active,
    .w3m-button-primary:active {
      transform: translateY(0);
      box-shadow: ${shadows.sm};
    }

    .btn-primary:disabled,
    .w3m-button-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    /* Secondary Button */
    .btn-secondary,
    .w3m-button-secondary {
      background: ${colors.surface};
      color: ${colors.text};
      border: 2px solid ${colors.border};
      border-radius: ${borderRadius.md};
      padding: 8px 18px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-family: 'Inter', sans-serif;
    }

    .btn-secondary:hover,
    .w3m-button-secondary:hover {
      background: ${colors.surfaceAlt};
      border-color: ${colors.primary};
      color: ${colors.primary};
    }

    .btn-secondary:active,
    .w3m-button-secondary:active {
      background: ${colors.surface};
    }

    .btn-secondary:disabled,
    .w3m-button-secondary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Success Button */
    .btn-success,
    .w3m-button-success {
      background: ${colors.success};
      color: #ffffff;
      border: none;
      border-radius: ${borderRadius.md};
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-family: 'Inter', sans-serif;
    }

    .btn-success:hover,
    .w3m-button-success:hover {
      background: ${colors.successDark};
      box-shadow: ${shadows.md};
      transform: translateY(-2px);
    }

    /* Error Button */
    .btn-error,
    .w3m-button-error {
      background: ${colors.error};
      color: #ffffff;
      border: none;
      border-radius: ${borderRadius.md};
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-family: 'Inter', sans-serif;
    }

    .btn-error:hover,
    .w3m-button-error:hover {
      background: ${colors.errorDark};
      box-shadow: ${shadows.md};
      transform: translateY(-2px);
    }

    /* Ghost Button */
    .btn-ghost,
    .w3m-button-ghost {
      background: transparent;
      color: ${colors.primary};
      border: 1px solid transparent;
      border-radius: ${borderRadius.md};
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-family: 'Inter', sans-serif;
    }

    .btn-ghost:hover,
    .w3m-button-ghost:hover {
      background: ${colors.primaryLight}22;
      border-color: ${colors.primary};
    }

    /* Text Button */
    .btn-text,
    .w3m-button-text {
      background: transparent;
      color: ${colors.primary};
      border: none;
      padding: 10px 0;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: color 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-family: 'Inter', sans-serif;
    }

    .btn-text:hover,
    .w3m-button-text:hover {
      color: ${colors.primaryDark};
      text-decoration: underline;
    }

    /* Button Sizes */
    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    .btn-lg {
      padding: 12px 24px;
      font-size: 16px;
    }

    .btn-xl {
      padding: 14px 28px;
      font-size: 16px;
      min-width: 200px;
    }

    /* Button Full Width */
    .btn-full {
      width: 100%;
    }

    /* Button Group */
    .btn-group {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .btn-group-vertical {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    /* Icon Button */
    .btn-icon {
      width: 40px;
      height: 40px;
      padding: 0;
      border-radius: ${borderRadius.md};
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${colors.surface};
      border: 1px solid ${colors.border};
      color: ${colors.text};
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 20px;
    }

    .btn-icon:hover {
      background: ${colors.primary};
      border-color: ${colors.primary};
      color: #ffffff;
    }

    /* Link Button */
    .btn-link {
      background: transparent;
      border: none;
      color: ${colors.primary};
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-link:hover {
      text-decoration: underline;
      color: ${colors.primaryDark};
    }

    /* Loading State */
    .btn:disabled,
    .btn-loading {
      opacity: 0.6;
      cursor: not-allowed;
      pointer-events: none;
    }

    .btn-loading::after {
      content: '';
      display: inline-block;
      width: 14px;
      height: 14px;
      margin-left: 8px;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    /* Focus State */
    .btn:focus-visible {
      outline: 2px solid ${colors.primary};
      outline-offset: 2px;
    }

    /* Interactive Elements */
    .interactive-element {
      cursor: pointer;
      transition: all 0.2s ease;
      border-radius: ${borderRadius.md};
    }

    .interactive-element:hover {
      background: ${colors.surfaceAlt};
    }

    .interactive-element:active {
      transform: scale(0.98);
    }

    /* Checkbox */
    .checkbox,
    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: ${colors.primary};
    }

    /* Radio Button */
    .radio,
    input[type="radio"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: ${colors.primary};
    }

    /* Toggle Switch */
    .toggle {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
      background: ${colors.border};
      border-radius: ${borderRadius.full};
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .toggle::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      background: #ffffff;
      border-radius: ${borderRadius.full};
      top: 2px;
      left: 2px;
      transition: left 0.3s ease;
      box-shadow: ${shadows.sm};
    }

    .toggle.active {
      background: ${colors.primary};
    }

    .toggle.active::after {
      left: 22px;
    }

    /* Tooltip */
    .tooltip {
      position: relative;
      display: inline-block;
    }

    .tooltip::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: 125%;
      left: 50%;
      transform: translateX(-50%);
      background: ${colors.text};
      color: ${colors.background};
      padding: 6px 12px;
      border-radius: ${borderRadius.sm};
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      z-index: 1000;
    }

    .tooltip:hover::after {
      opacity: 1;
    }

    /* Badge */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: ${colors.primaryLight}33;
      color: ${colors.primary};
      padding: 4px 8px;
      border-radius: ${borderRadius.sm};
      font-size: 12px;
      font-weight: 600;
    }

    /* Animation */
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `;
};

/**
 * Export styles as constants
 */
export const buttonStylesLight = generateButtonStyles('light');
export const buttonStylesDark = generateButtonStyles('dark');

/**
 * Inject button styles into document
 */
export function injectButtonStyles(mode: 'light' | 'dark'): void {
  const styleId = `appkit-button-styles-${mode}`;

  // Remove existing style if present
  const existing = document.getElementById(styleId);
  if (existing) {
    existing.remove();
  }

  // Create and inject new style
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = generateButtonStyles(mode);

  if (document.head) {
    document.head.appendChild(style);
  }
}

/**
 * Update button styles when theme changes
 */
export function updateButtonStyles(mode: 'light' | 'dark'): void {
  // Remove opposite mode styles
  const oppositeMode = mode === 'light' ? 'dark' : 'light';
  const oppositeStyle = document.getElementById(`appkit-button-styles-${oppositeMode}`);
  if (oppositeStyle) {
    oppositeStyle.remove();
  }

  // Inject new styles
  injectButtonStyles(mode);
}
