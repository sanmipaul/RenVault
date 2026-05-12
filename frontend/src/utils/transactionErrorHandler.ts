import { WalletError, WalletErrorCode } from './wallet-errors';
import { ContractErrorMapper } from './contractErrorMapper';

export class TransactionErrorHandler {
  static isFeeError(error: Error): boolean {
    const feeErrors = ['fee too low', 'insufficient fee', 'fee below minimum', 'fee exceeds maximum', 'fee required'];
    return feeErrors.some(msg => error.message.toLowerCase().includes(msg));
  }

  static isRetryable(error: Error): boolean {
    const retryableErrors = ['network', 'timeout', 'connection', 'ECONNREFUSED', 'fee too low', 'insufficient fee'];
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

    if (error instanceof Error) {
      if (this.isFeeError(error)) return `Fee error: ${error.message}`;
      return error.message;
    }
    return 'Unknown error occurred';
  }
}
