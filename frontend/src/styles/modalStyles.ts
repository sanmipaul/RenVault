/**
 * Modal Styles
 * Custom styling for AppKit modals with RenVault branding
 */

import { renvaultColors, darkModeColors, shadows, borderRadius } from '../config/appkit-theme';

/**
 * Generate modal CSS for AppKit
 */
export const generateModalStyles = (mode: 'light' | 'dark'): string => {
  const colors = mode === 'light' ? renvaultColors : darkModeColors;

  return `
    /* Modal Container */
    .w3m-modal {
      backdrop-filter: blur(8px);
      background-color: ${mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(26, 26, 26, 0.95)'};
      border: 1px solid ${colors.border};
      border-radius: ${borderRadius['2xl']};
      box-shadow: ${shadows.lg};
      animation: modalSlideIn 0.3s ease-out;
    }

    /* Modal Content */
    .w3m-modal-content {
      background: ${colors.background};
      color: ${colors.text};
      border-radius: ${borderRadius.lg};
      padding: 24px;
    }

    /* Modal Header */
    .w3m-modal-header {
      border-bottom: 1px solid ${colors.border};
      margin-bottom: 20px;
      padding-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .w3m-modal-title {
      font-size: 20px;
      font-weight: 600;
      color: ${colors.text};
      font-family: 'Poppins', sans-serif;
    }

    /* Modal Close Button */
    .w3m-modal-close {
      background: transparent;
      border: none;
      color: ${colors.textSecondary};
      cursor: pointer;
      font-size: 24px;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: ${borderRadius.md};
      transition: all 0.2s ease;
    }

    .w3m-modal-close:hover {
      background: ${colors.surfaceAlt};
      color: ${colors.text};
    }

    /* Modal Body */
    .w3m-modal-body {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 20px;
    }

    /* Modal Footer */
    .w3m-modal-footer {
      border-top: 1px solid ${colors.border};
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 20px;
      padding-top: 16px;
    }

    /* Wallet List Items */
    .w3m-wallet-item {
      background: ${colors.surface};
      border: 1px solid ${colors.border};
      border-radius: ${borderRadius.lg};
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .w3m-wallet-item:hover {
      background: ${colors.surfaceAlt};
      border-color: ${colors.primary};
      transform: translateY(-2px);
      box-shadow: ${shadows.sm};
    }

    .w3m-wallet-item-icon {
      width: 48px;
      height: 48px;
      border-radius: ${borderRadius.md};
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${colors.primaryLight};
      flex-shrink: 0;
    }

    .w3m-wallet-item-icon img {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }

    .w3m-wallet-item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .w3m-wallet-item-name {
      font-size: 14px;
      font-weight: 600;
      color: ${colors.text};
    }

    .w3m-wallet-item-description {
      font-size: 12px;
      color: ${colors.textSecondary};
    }

    /* Tabs */
    .w3m-tabs {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid ${colors.border};
      margin-bottom: 16px;
    }

    .w3m-tab {
      background: transparent;
      border: none;
      color: ${colors.textSecondary};
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      padding: 12px 16px;
      position: relative;
      transition: color 0.2s ease;
    }

    .w3m-tab.active {
      color: ${colors.primary};
    }

    .w3m-tab.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: ${colors.primary};
      border-radius: ${borderRadius.full};
    }

    /* Input Fields */
    .w3m-input {
      background: ${colors.surface};
      border: 1px solid ${colors.border};
      border-radius: ${borderRadius.md};
      color: ${colors.text};
      font-size: 14px;
      padding: 10px 12px;
      transition: all 0.2s ease;
      font-family: 'Inter', sans-serif;
    }

    .w3m-input:focus {
      background: ${colors.background};
      border-color: ${colors.primary};
      outline: none;
      box-shadow: 0 0 0 3px ${colors.primaryLight}33;
    }

    .w3m-input::placeholder {
      color: ${colors.textSecondary};
    }

    /* Loading State */
    .w3m-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .w3m-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid ${colors.border};
      border-top-color: ${colors.primary};
      border-radius: ${borderRadius.full};
      animation: spin 1s linear infinite;
    }

    /* Error State */
    .w3m-error {
      background: ${colors.errorLight}33;
      border: 1px solid ${colors.error};
      border-radius: ${borderRadius.md};
      color: ${colors.error};
      padding: 12px;
      font-size: 14px;
      margin-bottom: 12px;
    }

    /* Success State */
    .w3m-success {
      background: ${colors.successLight}33;
      border: 1px solid ${colors.success};
      border-radius: ${borderRadius.md};
      color: ${colors.success};
      padding: 12px;
      font-size: 14px;
      margin-bottom: 12px;
    }

    /* Disabled State */
    .w3m-disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    /* Animations */
    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes modalFadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Scroll Behavior */
    .w3m-modal-scroll {
      max-height: 60vh;
      overflow-y: auto;
      scroll-behavior: smooth;
    }

    .w3m-modal-scroll::-webkit-scrollbar {
      width: 6px;
    }

    .w3m-modal-scroll::-webkit-scrollbar-track {
      background: ${colors.surface};
      border-radius: ${borderRadius.full};
    }

    .w3m-modal-scroll::-webkit-scrollbar-thumb {
      background: ${colors.border};
      border-radius: ${borderRadius.full};
    }

    .w3m-modal-scroll::-webkit-scrollbar-thumb:hover {
      background: ${colors.primaryLight};
    }
  `;
};

/**
 * Export CSS as constant
 */
export const modalStylesLight = generateModalStyles('light');
export const modalStylesDark = generateModalStyles('dark');

/**
 * Inject modal styles into document
 */
export function injectModalStyles(mode: 'light' | 'dark'): void {
  const styleId = `appkit-modal-styles-${mode}`;

  // Remove existing style if present
  const existing = document.getElementById(styleId);
  if (existing) {
    existing.remove();
  }

  // Create and inject new style
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = generateModalStyles(mode);

  if (document.head) {
    document.head.appendChild(style);
  }
}

/**
 * Update modal styles when theme changes
 */
export function updateModalStyles(mode: 'light' | 'dark'): void {
  // Remove opposite mode styles
  const oppositeMode = mode === 'light' ? 'dark' : 'light';
  const oppositeStyle = document.getElementById(`appkit-modal-styles-${oppositeMode}`);
  if (oppositeStyle) {
    oppositeStyle.remove();
  }

  // Inject new styles
  injectModalStyles(mode);
}
