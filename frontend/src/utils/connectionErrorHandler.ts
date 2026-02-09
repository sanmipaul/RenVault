export class ConnectionErrorHandler {
  static isRetryable(error: any): boolean {
    const retryableErrors = ['network', 'timeout', 'connection', 'ECONNREFUSED'];
    return retryableErrors.some(msg => error?.message?.toLowerCase().includes(msg));
  }

  static getErrorMessage(error: any): string {
    return error?.message || 'Unknown connection error';
  }

  static handleError(error: any, context: string): Error {
    const message = `${context}: ${this.getErrorMessage(error)}`;
    return new Error(message);
  }
}
