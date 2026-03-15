import { WalletError, WalletErrorCode } from './wallet-errors';
import { ContractErrorMapper } from './contractErrorMapper';

export class TransactionErrorHandler {
  static isRetryable(error: Error): boolean {
    const retryableErrors = ['network', 'timeout', 'connection', 'ECONNREFUSED'];
    return retryableErrors.some(msg => error.message.toLowerCase().includes(msg));
  }

  static handleError(error: unknown, context: string, contractName?: string): WalletError {
    if (error instanceof WalletError) return error;

    // Attempt contract-level error mapping when a contract name is provided
    if (contractName && ContractErrorMapper.isContractError(error)) {
      const descriptor = ContractErrorMapper.map(error, contractName);
      const message = descriptor.hint
        ? `${descriptor.message} ${descriptor.hint}`
        : descriptor.message;
      return new WalletError(WalletErrorCode.TRANSACTION_FAILED, message, error);
    }

    const err = error instanceof Error ? error : new Error(String(error));

    if (this.isRetryable(err)) {
      return new WalletError(WalletErrorCode.NETWORK_ERROR, `${context}: ${err.message}`, error);
    }

    return new WalletError(WalletErrorCode.TRANSACTION_FAILED, `${context}: ${err.message}`, error);
  }

  static getErrorMessage(error: unknown, contractName?: string): string {
    if (error instanceof WalletError) return error.message;

    if (contractName && ContractErrorMapper.isContractError(error)) {
      return ContractErrorMapper.toStatusMessage(error, contractName);
    }

    if (error instanceof Error) return error.message;
    return 'Unknown error occurred';
  }
}
