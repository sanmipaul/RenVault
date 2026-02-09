export class ConnectionDiagnostics {
  static async diagnose(providerId: string): Promise<{ healthy: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    if (!window.navigator.onLine) {
      issues.push('No internet connection');
    }
    
    return {
      healthy: issues.length === 0,
      issues
    };
  }

  static getNetworkInfo() {
    return {
      online: window.navigator.onLine,
      effectiveType: (navigator as any).connection?.effectiveType,
      downlink: (navigator as any).connection?.downlink
    };
  }
}
