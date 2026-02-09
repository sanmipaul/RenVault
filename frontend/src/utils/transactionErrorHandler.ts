import { WalletError, WalletErrorCode } from './wallet-errors';

export class TransactionErrorHandler {
  static isRetryable(error: Error): boolean {
    const retryableErrors = ['network', 'timeout', 'connection', 'ECONNREFUSED'];
    return retryableErrors.some(msg => error.message.toLowerCase().includes(msg));
  }

  static handleError(error: any, context: string): WalletError {
    if (error instanceof WalletError) return error;
    
    if (this.isRetryable(error)) {
      return new WalletError(WalletErrorCode.NETWORK_ERROR, `${context}: ${error.message}`);
    }
    
    return new WalletError(WalletErrorCode.TRANSACTION_FAILED, `${context}: ${error.message}`);
  }

  static getErrorMessage(error: any): string {
    if (error instanceof WalletError) return error.message;
    return error?.message || 'Unknown error occurred';
  }
}
