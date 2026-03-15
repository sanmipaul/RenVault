import { WalletError, WalletErrorCode } from './wallet-errors';

export class TransactionErrorHandler {
  static isRetryable(error: Error): boolean {
    const retryableErrors = ['network', 'timeout', 'connection', 'ECONNREFUSED'];
    return retryableErrors.some(msg => error.message.toLowerCase().includes(msg));
  }

  static handleError(error: unknown, context: string): WalletError {
    if (error instanceof WalletError) return error;
    const msg = error instanceof Error ? error.message : String(error);

    if (error instanceof Error && this.isRetryable(error)) {
      return new WalletError(WalletErrorCode.NETWORK_ERROR, `${context}: ${msg}`);
    }

    return new WalletError(WalletErrorCode.TRANSACTION_FAILED, `${context}: ${msg}`);
  }

  static getErrorMessage(error: unknown): string {
    if (error instanceof WalletError) return error.message;
    if (error instanceof Error) return error.message;
    return 'Unknown error occurred';
  }
}
