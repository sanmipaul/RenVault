export class WalletErrorHandler {
  private errorLog: Array<{error: string; timestamp: number}> = [];

  handleError(error: any, context: string): string {
    const errorMsg = this.parseError(error);
    this.logError(errorMsg, context);
    return errorMsg;
  }

  private parseError(error: any): string {
    if (error.code === 4001) return 'User rejected the request';
    if (error.code === -32002) return 'Request already pending';
    if (error.code === -32603) return 'Internal error';
    if (error.message?.includes('timeout')) return 'Connection timeout';
    if (error.message?.includes('network')) return 'Network error';
    return error.message || 'Unknown error occurred';
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

  shouldRetry(error: any): boolean {
    const retryableCodes = [-32002, -32603];
    return retryableCodes.includes(error.code) || 
           error.message?.includes('timeout') ||
           error.message?.includes('network');
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
