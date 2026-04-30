import { isValidHttpsUrl } from './urlValidator';

export class ConnectionDiagnostics {
  static async diagnose(providerId: string): Promise<{ healthy: boolean; issues: string[] }> {
    const issues: string[] = [];

    if (!window.navigator.onLine) {
      issues.push('No internet connection');
    }

    return {
      healthy: issues.length === 0,
      issues,
    };
  }

  static validateEndpointUrl(url: string): { valid: boolean; reason?: string } {
    if (!url || url.trim() === '') return { valid: false, reason: 'URL is empty' };
    if (!isValidHttpsUrl(url)) return { valid: false, reason: 'URL must be a valid HTTPS URL' };
    return { valid: true };
  }

  static getNetworkInfo() {
    return {
      online: window.navigator.onLine,
      effectiveType: (navigator as any).connection?.effectiveType,
      downlink: (navigator as any).connection?.downlink,
    };
  }
}
