/**
 * Logo Service
 * Handles RenVault logo integration in modals
 */

export interface LogoConfig {
  url: string;
  width: number;
  height: number;
  alt: string;
  title?: string;
}

export class LogoService {
  private static logoUrl: string = '/renvault-logo.svg';
  private static darkModeLogoUrl: string = '/renvault-logo-dark.svg';
  private static logoConfig: LogoConfig = {
    url: '/renvault-logo.svg',
    width: 120,
    height: 40,
    alt: 'RenVault',
    title: 'RenVault - Decentralized Asset Vault',
  };

  /**
   * Set custom logo URL
   */
  static setLogoUrl(url: string, darkModeUrl?: string): void {
    this.logoUrl = url;
    if (darkModeUrl) {
      this.darkModeLogoUrl = darkModeUrl;
    }
    this.updateLogoConfig();
  }

  /**
   * Get logo for theme
   */
  static getLogoForTheme(theme: 'light' | 'dark'): string {
    return theme === 'dark' ? this.darkModeLogoUrl : this.logoUrl;
  }

  /**
   * Get logo configuration
   */
  static getLogoConfig(): LogoConfig {
    return { ...this.logoConfig };
  }

  /**
   * Update logo configuration
   */
  static setLogoConfig(config: Partial<LogoConfig>): void {
    this.logoConfig = { ...this.logoConfig, ...config };
  }

  /**
   * Create logo element
   */
  static createLogoElement(
    theme: 'light' | 'dark' = 'light',
    customConfig?: Partial<LogoConfig>
  ): HTMLImageElement {
    const config = { ...this.logoConfig, ...customConfig };
    const img = document.createElement('img');

    img.src = this.getLogoForTheme(theme);
    img.alt = config.alt;
    img.title = config.title || '';
    img.width = config.width;
    img.height = config.height;
    img.style.cssText = `
      max-width: 100%;
      height: auto;
      object-fit: contain;
      image-rendering: crisp-edges;
    `;

    return img;
  }

  /**
   * Create logo SVG element
   */
  static createLogoSVG(theme: 'light' | 'dark' = 'light'): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 120 40');
    svg.setAttribute('width', '120');
    svg.setAttribute('height', '40');
    svg.setAttribute('alt', 'RenVault');

    // Create logo path for inline rendering
    const colors = theme === 'light' ? { text: '#1a1a1a', primary: '#4a80f5' } : { text: '#ffffff', primary: '#6a96f7' };

    // Create circle background
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '20');
    circle.setAttribute('cy', '20');
    circle.setAttribute('r', '18');
    circle.setAttribute('fill', colors.primary);
    svg.appendChild(circle);

    // Create text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '45');
    text.setAttribute('y', '26');
    text.setAttribute('font-size', '20');
    text.setAttribute('font-weight', '700');
    text.setAttribute('font-family', 'Poppins, sans-serif');
    text.setAttribute('fill', colors.text);
    text.textContent = 'RenVault';
    svg.appendChild(text);

    return svg;
  }

  /**
   * Inject logo into modal
   */
  static injectLogoIntoModal(
    modalElement: HTMLElement,
    theme: 'light' | 'dark' = 'light',
    position: 'header' | 'top' | 'bottom' = 'header'
  ): void {
    if (!modalElement) return;

    // Create logo container
    const logoContainer = document.createElement('div');
    logoContainer.className = 'renvault-logo-container';
    logoContainer.style.cssText = `
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 16px 0;
      ${position === 'header' ? 'border-bottom: 1px solid rgba(0, 0, 0, 0.1);' : ''}
    `;

    // Add logo
    const logoImg = this.createLogoElement(theme);
    logoContainer.appendChild(logoImg);

    // Insert based on position
    switch (position) {
      case 'header':
        const header = modalElement.querySelector('.w3m-modal-header');
        if (header) {
          header.parentElement?.insertBefore(logoContainer, header);
        } else {
          modalElement.insertBefore(logoContainer, modalElement.firstChild);
        }
        break;
      case 'top':
        modalElement.insertBefore(logoContainer, modalElement.firstChild);
        break;
      case 'bottom':
        modalElement.appendChild(logoContainer);
        break;
    }
  }

  /**
   * Update logo theme
   */
  static updateLogoTheme(theme: 'light' | 'dark'): void {
    const logos = document.querySelectorAll<HTMLImageElement>('.renvault-logo');
    logos.forEach(logo => {
      logo.src = this.getLogoForTheme(theme);
    });
  }

  /**
   * Preload logo
   */
  static preloadLogo(theme: 'light' | 'dark' = 'light'): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load logo for ${theme} theme`));
      img.src = this.getLogoForTheme(theme);
    });
  }

  /**
   * Preload all logos
   */
  static async preloadAllLogos(): Promise<void> {
    try {
      await Promise.all([
        this.preloadLogo('light'),
        this.preloadLogo('dark'),
      ]);
    } catch (error) {
      console.error('Failed to preload logos:', error);
    }
  }

  /**
   * Get logo as data URL
   */
  static getLogoAsDataURL(theme: 'light' | 'dark' = 'light'): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };

      img.onerror = () => {
        reject(new Error(`Failed to load logo for ${theme} theme`));
      };

      img.src = this.getLogoForTheme(theme);
    });
  }
}

/**
 * React Hook for logo
 */
import React from 'react';

export const useLogo = (theme: 'light' | 'dark' = 'light') => {
  const [logoUrl, setLogoUrl] = React.useState(() =>
    LogoService.getLogoForTheme(theme)
  );

  React.useEffect(() => {
    setLogoUrl(LogoService.getLogoForTheme(theme));
  }, [theme]);

  return {
    url: logoUrl,
    config: LogoService.getLogoConfig(),
    createElement: () => LogoService.createLogoElement(theme),
    preload: () => LogoService.preloadLogo(theme),
  };
};
