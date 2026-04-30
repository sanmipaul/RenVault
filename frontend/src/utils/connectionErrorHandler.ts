export class ConnectionErrorHandler {
  static isRetryable(error: unknown): boolean {
    const retryableErrors = ['network', 'timeout', 'connection', 'ECONNREFUSED'];
    const msg = error instanceof Error ? error.message.toLowerCase() : '';
    return retryableErrors.some(term => msg.includes(term));
  }

  static getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return 'Unknown connection error';
  }

  static handleError(error: unknown, context: string): Error {
    const message = `${context}: ${this.getErrorMessage(error)}`;
    return new Error(message);
  }
}
