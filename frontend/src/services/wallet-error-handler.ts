export class WalletErrorHandler {
  private errorLog: Array<{error: string; timestamp: number}> = [];

  handleError(error: unknown, context: string): string {
    const errorMsg = this.parseError(error);
    this.logError(errorMsg, context);
    return errorMsg;
  }

  private parseError(error: unknown): string {
    if (typeof error === 'object' && error !== null) {
      const e = error as { code?: number; message?: string };
      if (e.code === 4001) return 'User rejected the request';
      if (e.code === -32002) return 'Request already pending';
      if (e.code === -32603) return 'Internal error';
      if (e.message?.includes('timeout')) return 'Connection timeout';
      if (e.message?.includes('network')) return 'Network error';
      return e.message ?? 'Unknown error occurred';
    }
    return 'Unknown error occurred';
  }

  private logError(error: string, context: string) {
    this.errorLog.push({
      error: `${context}: ${error}`,
      timestamp: Date.now()
    });
    if (this.errorLog.length > 100) {
      this.errorLog.shift();
    }
  }

  getRecentErrors(limit: number = 10) {
    return this.errorLog.slice(-limit);
  }

  shouldRetry(error: unknown): boolean {
    if (typeof error === 'object' && error !== null) {
      const e = error as { code?: number; message?: string };
      const retryableCodes = [-32002, -32603];
      return (e.code !== undefined && retryableCodes.includes(e.code)) ||
        !!e.message?.includes('timeout') ||
        !!e.message?.includes('network');
    }
    return false;
  }

  clearErrors() {
    this.errorLog = [];
  }

  getErrorStats() {
    const errorTypes = new Map<string, number>();
    this.errorLog.forEach(log => {
      const type = log.error.split(':')[0];
      errorTypes.set(type, (errorTypes.get(type) || 0) + 1);
    });
    return Object.fromEntries(errorTypes);
  }
}

export const errorHandler = new WalletErrorHandler();
