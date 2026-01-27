/**
 * Responsive Theme Adjustments
 * Media queries and responsive styling for different screen sizes
 */

import { spacing, typography, borderRadius } from '../config/appkit-theme';

/**
 * Breakpoints for responsive design
 */
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

/**
 * Responsive design utilities
 */
export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs})`,
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  '2xl': `(min-width: ${breakpoints['2xl']})`,
  maxSm: `(max-width: ${breakpoints.sm})`,
  maxMd: `(max-width: ${breakpoints.md})`,
  maxLg: `(max-width: ${breakpoints.lg})`,
  maxXl: `(max-width: ${breakpoints.xl})`,
  landscape: '(orientation: landscape)',
  portrait: '(orientation: portrait)',
  touch: '(hover: none) and (pointer: coarse)',
  notTouch: '(hover: hover) and (pointer: fine)',
  darkMode: '(prefers-color-scheme: dark)',
  lightMode: '(prefers-color-scheme: light)',
  reduceMotion: '(prefers-reduced-motion: reduce)',
};

/**
 * Generate responsive modal styles
 */
export const generateResponsiveModalStyles = (): string => `
  /* Mobile Styles (default) */
  .w3m-modal {
    width: 100%;
    max-width: calc(100vw - 32px);
    max-height: 90vh;
    border-radius: ${borderRadius.lg};
  }

  .w3m-modal-content {
    padding: 16px;
  }

  .w3m-modal-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
  }

  .w3m-modal-title {
    font-size: ${typography.fontSize.lg};
  }

  .w3m-wallet-item {
    flex-direction: column;
    text-align: center;
    padding: 12px;
  }

  .w3m-wallet-item-icon {
    width: 40px;
    height: 40px;
  }

  .w3m-wallet-item-icon img {
    width: 24px;
    height: 24px;
  }

  /* Tablet Styles */
  @media (min-width: ${breakpoints.sm}) {
    .w3m-modal {
      width: auto;
      min-width: 400px;
      max-width: 500px;
    }

    .w3m-modal-content {
      padding: 20px;
    }

    .w3m-modal-title {
      font-size: ${typography.fontSize.xl};
    }

    .w3m-wallet-item {
      flex-direction: row;
      text-align: left;
      padding: 14px;
    }

    .w3m-wallet-item-icon {
      width: 44px;
      height: 44px;
    }

    .w3m-wallet-item-icon img {
      width: 28px;
      height: 28px;
    }
  }

  /* Large Screens */
  @media (min-width: ${breakpoints.lg}) {
    .w3m-modal {
      min-width: 480px;
      max-width: 600px;
    }

    .w3m-modal-content {
      padding: 24px;
    }

    .w3m-modal-header {
      margin-bottom: 20px;
      padding-bottom: 16px;
    }

    .w3m-modal-title {
      font-size: ${typography.fontSize['2xl']};
    }

    .w3m-wallet-item {
      padding: 16px;
    }

    .w3m-wallet-item-icon {
      width: 48px;
      height: 48px;
    }

    .w3m-wallet-item-icon img {
      width: 32px;
      height: 32px;
    }
  }

  /* Extra Large Screens */
  @media (min-width: ${breakpoints.xl}) {
    .w3m-modal {
      min-width: 520px;
      max-width: 700px;
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .w3m-modal,
    .w3m-wallet-item,
    .btn,
    .interactive-element {
      animation: none !important;
      transition: none !important;
    }
  }

  /* Touch Devices */
  @media (hover: none) and (pointer: coarse) {
    .w3m-modal-close:active {
      background: rgba(74, 128, 245, 0.1);
    }

    .w3m-wallet-item:active {
      opacity: 0.8;
    }

    .btn:active {
      opacity: 0.8;
    }
  }

  /* High DPI Screens */
  @media (min-resolution: 2dppx) {
    .w3m-modal {
      border-width: 0.5px;
    }
  }

  /* Dark Mode Adjustments */
  @media (prefers-color-scheme: dark) {
    .w3m-modal {
      background: rgba(26, 26, 26, 0.95);
    }
  }

  /* Light Mode Adjustments */
  @media (prefers-color-scheme: light) {
    .w3m-modal {
      background: rgba(255, 255, 255, 0.95);
    }
  }
`;

/**
 * Generate responsive button styles
 */
export const generateResponsiveButtonStyles = (): string => `
  /* Mobile Button Styles */
  .btn {
    padding: 12px 16px;
    font-size: ${typography.fontSize.sm};
    border-radius: ${borderRadius.md};
    min-width: auto;
  }

  .btn-xl {
    width: 100%;
  }

  .btn-group {
    flex-direction: column;
    width: 100%;
  }

  .btn-group > .btn {
    width: 100%;
  }

  /* Tablet Button Styles */
  @media (min-width: ${breakpoints.sm}) {
    .btn {
      padding: 10px 20px;
      font-size: ${typography.fontSize.base};
    }

    .btn-group {
      flex-direction: row;
      width: auto;
    }

    .btn-group > .btn {
      width: auto;
    }

    .btn-group-vertical {
      flex-direction: column;
    }

    .btn-group-vertical > .btn {
      width: 100%;
    }
  }

  /* Large Button Styles */
  @media (min-width: ${breakpoints.lg}) {
    .btn {
      padding: 10px 24px;
    }

    .btn-lg {
      padding: 12px 28px;
    }
  }

  /* Touch Device Button Adjustments */
  @media (hover: none) and (pointer: coarse) {
    .btn {
      min-height: 44px;
      min-width: 44px;
      padding: 12px 20px;
    }
  }

  /* Landscape Mode */
  @media (orientation: landscape) {
    .btn-group {
      justify-content: space-between;
    }

    .w3m-modal {
      max-height: 80vh;
    }
  }
`;

/**
 * Generate responsive typography styles
 */
export const generateResponsiveTypographyStyles = (): string => `
  /* Mobile Typography */
  body {
    font-size: ${typography.fontSize.base};
    line-height: ${typography.lineHeight.normal};
  }

  h1 {
    font-size: ${typography.fontSize.xl};
    line-height: ${typography.lineHeight.tight};
    margin-bottom: ${spacing.md};
  }

  h2 {
    font-size: ${typography.fontSize.lg};
    line-height: ${typography.lineHeight.tight};
    margin-bottom: ${spacing.sm};
  }

  h3 {
    font-size: ${typography.fontSize.base};
    line-height: ${typography.lineHeight.normal};
    margin-bottom: ${spacing.xs};
  }

  p {
    font-size: ${typography.fontSize.base};
    line-height: ${typography.lineHeight.relaxed};
    margin-bottom: ${spacing.sm};
  }

  /* Tablet Typography */
  @media (min-width: ${breakpoints.sm}) {
    body {
      font-size: ${typography.fontSize.base};
    }

    h1 {
      font-size: ${typography.fontSize['2xl']};
    }

    h2 {
      font-size: ${typography.fontSize.xl};
    }

    h3 {
      font-size: ${typography.fontSize.lg};
    }
  }

  /* Desktop Typography */
  @media (min-width: ${breakpoints.lg}) {
    h1 {
      font-size: ${typography.fontSize['3xl']};
    }

    h2 {
      font-size: ${typography.fontSize['2xl']};
    }

    h3 {
      font-size: ${typography.fontSize.xl};
    }
  }
`;

/**
 * Generate responsive spacing styles
 */
export const generateResponsiveSpacingStyles = (): string => `
  /* Mobile Spacing */
  .container {
    padding: ${spacing.md} ${spacing.sm};
  }

  .section {
    margin-bottom: ${spacing.lg};
  }

  .card {
    padding: ${spacing.md};
    margin-bottom: ${spacing.md};
  }

  /* Tablet Spacing */
  @media (min-width: ${breakpoints.sm}) {
    .container {
      padding: ${spacing.lg} ${spacing.md};
    }

    .section {
      margin-bottom: ${spacing['2xl']};
    }

    .card {
      padding: ${spacing.lg};
      margin-bottom: ${spacing.lg};
    }
  }

  /* Desktop Spacing */
  @media (min-width: ${breakpoints.lg}) {
    .container {
      padding: ${spacing['2xl']} ${spacing.lg};
    }

    .section {
      margin-bottom: ${spacing['3xl']};
    }

    .card {
      padding: ${spacing['2xl']};
      margin-bottom: ${spacing['2xl']};
    }
  }
`;

/**
 * Export all responsive styles
 */
export const allResponsiveStyles = `
  ${generateResponsiveModalStyles()}
  ${generateResponsiveButtonStyles()}
  ${generateResponsiveTypographyStyles()}
  ${generateResponsiveSpacingStyles()}
`;

/**
 * Inject responsive styles into document
 */
export function injectResponsiveStyles(): void {
  const styleId = 'appkit-responsive-styles';

  // Remove existing style if present
  const existing = document.getElementById(styleId);
  if (existing) {
    existing.remove();
  }

  // Create and inject new style
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = allResponsiveStyles;

  if (document.head) {
    document.head.appendChild(style);
  }
}

/**
 * Check if media query matches
 */
export function matchesMediaQuery(query: keyof typeof mediaQueries): boolean {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia(mediaQueries[query]).matches;
  }
  return false;
}

/**
 * Subscribe to media query changes
 */
export function onMediaQueryChange(
  query: keyof typeof mediaQueries,
  callback: (matches: boolean) => void
): () => void {
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mql = window.matchMedia(mediaQueries[query]);
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      callback(e.matches);
    };

    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    }
  }

  return () => {};
}

/**
 * Get current breakpoint
 */
export function getCurrentBreakpoint(): keyof typeof breakpoints {
  if (matchesMediaQuery('2xl')) return '2xl';
  if (matchesMediaQuery('xl')) return 'xl';
  if (matchesMediaQuery('lg')) return 'lg';
  if (matchesMediaQuery('md')) return 'md';
  if (matchesMediaQuery('sm')) return 'sm';
  return 'xs';
}
