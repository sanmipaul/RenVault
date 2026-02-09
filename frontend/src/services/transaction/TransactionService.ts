// services/transaction/TransactionService.ts
import { WalletManager } from '../wallet/WalletManager';
import { WalletError, WalletErrorCode } from '../../utils/wallet-errors';
import { generateSecureTransactionId } from '../../utils/crypto';
import { TransactionStateManager } from './TransactionStateManager';
import { TransactionQueue } from './TransactionQueue';
import { TransactionCache } from './TransactionCache';
import { TransactionMonitor } from './TransactionMonitor';
import { TransactionRecovery } from '../../utils/transactionRecovery';
import { TransactionTimeout } from '../../utils/transactionTimeout';
import { TransactionErrorHandler } from '../../utils/transactionErrorHandler';
import { retryWithBackoff } from '../../utils/retry';
import { validateTransactionDetails } from '../../utils/transactionValidator';
import { TransactionStatus } from '../../types/transactionState';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

export interface TransactionDetails {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: any[];
  amount: number;
  fee?: number;
  network: string;
  isSponsored?: boolean;
  sponsorAddress?: string;
  sponsorSignature?: string;
  anchorMode?: AnchorMode;
  postConditionMode?: PostConditionMode;
}

export interface SignedTransaction {
  txId: string;
  signedTx: any;
  details: TransactionDetails;
}

export class TransactionService {
  private static instance: TransactionService;
  private walletManager: WalletManager;
  private network = new StacksMainnet();
  private stateManager = new TransactionStateManager();
  private queue = new TransactionQueue();
  private cache = new TransactionCache();
  private monitor = new TransactionMonitor();
  private timeout = new TransactionTimeout();

  private constructor() {
    this.walletManager = WalletManager.getInstance();
  }

  static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  async prepareDepositTransaction(
    amount: number,
    isSponsored: boolean = false,
    contractAddress: string = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.ren-vault'
  ): Promise<TransactionDetails> {
    try {
      if (amount <= 0) {
        throw new WalletError(WalletErrorCode.INVALID_TRANSACTION, 'Deposit amount must be greater than 0');
      }
      if (amount > 1000000) {
        throw new WalletError(WalletErrorCode.INVALID_TRANSACTION, 'Deposit amount cannot exceed 1,000,000 STX');
      }
      if (!this.isValidStacksAddress(contractAddress)) {
        throw new WalletError(WalletErrorCode.INVALID_TRANSACTION, 'Invalid contract address format');
      }
      const microAmount = Math.floor(amount * 1000000);
      const details: TransactionDetails = {
        contractAddress,
        contractName: 'ren-vault',
        functionName: 'deposit',
        functionArgs: [uintCV(microAmount)],
        amount: microAmount,
        fee: isSponsored ? 0 : 1000,
        network: 'mainnet',
        isSponsored,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow
      };
      const errors = validateTransactionDetails(details);
      if (errors.length > 0) {
        throw new WalletError(WalletErrorCode.INVALID_TRANSACTION, `Validation failed: ${errors.join(', ')}`);
      }
      return details;
    } catch (error) {
      throw TransactionErrorHandler.handleError(error, 'Transaction preparation');
    }
  }

  async signDepositTransaction(details: TransactionDetails): Promise<SignedTransaction> {
    try {
      if (!this.walletManager.isConnected()) {
        throw new WalletError(
          WalletErrorCode.WALLET_NOT_CONNECTED,
          'Wallet not connected'
        );
      }

      // Create the contract call transaction
      const txOptions: any = {
        contractAddress: details.contractAddress,
        contractName: details.contractName,
        functionName: details.functionName,
        functionArgs: details.functionArgs,
        network: this.network,
        anchorMode: details.anchorMode || AnchorMode.Any,
        postConditionMode: details.postConditionMode || PostConditionMode.Allow,
        sponsored: details.isSponsored,
        onFinish: (data: any) => {
          console.log('Transaction signed:', data);
        },
        onCancel: () => {
          throw new WalletError(
            WalletErrorCode.TRANSACTION_SIGNING_CANCELLED,
            'Transaction signing was cancelled by user'
          );
        }
      };

      if (details.isSponsored && details.sponsorAddress) {
        txOptions.sponsorAddress = details.sponsorAddress;
      }

      // Use the wallet manager to sign the transaction
      const signedTx = await this.walletManager.signTransaction(txOptions);

      const signedTransaction: SignedTransaction = {
        txId: signedTx.txId || this.generateTxId(),
        signedTx,
        details
      };

      return signedTransaction;
    } catch (error) {
      console.error('Transaction signing failed:', error);
      if (error instanceof WalletError) {
        throw error;
      }
      throw new WalletError(
        WalletErrorCode.TRANSACTION_SIGNING_FAILED,
        `Failed to sign transaction: ${error.message}`
      );
    }
  }

  async broadcastTransaction(signedTx: SignedTransaction): Promise<string> {
    const txId = signedTx.txId;
    try {
      this.stateManager.setState(txId, TransactionStatus.BROADCASTING);
      this.monitor.recordTransaction();
      const result = await retryWithBackoff(async () => {
        const response = await broadcastTransaction({ transaction: signedTx.signedTx, network: this.network });
        if (response.error) throw new Error(response.error);
        return response.txid || txId;
      });
      this.stateManager.setState(txId, TransactionStatus.CONFIRMED);
      this.monitor.recordSuccess(Date.now());
      TransactionRecovery.removePendingTransaction(txId);
      return result;
    } catch (error) {
      this.stateManager.setState(txId, TransactionStatus.FAILED, TransactionErrorHandler.getErrorMessage(error));
      this.monitor.recordFailure();
      throw TransactionErrorHandler.handleError(error, 'Transaction broadcast');
    }
  }

  private generateTxId(): string {
    // Use cryptographically secure random for transaction IDs
    return generateSecureTransactionId();
  }

  validateTransactionDetails(details: TransactionDetails): boolean {
    return !!(
      details.contractAddress &&
      details.contractName &&
      details.functionName &&
      details.functionArgs &&
      details.amount &&
      details.amount > 0
    );
  }

  getNetwork(): StacksMainnet {
    return this.network;
  }

  private isValidStacksAddress(address: string): boolean {
    // Basic Stacks address validation
    // Stacks addresses start with SP, SM, or ST and are 28-30 characters long
    const stacksAddressRegex = /^(SP|SM|ST)[0-9A-Z]{26,28}$/;
    return stacksAddressRegex.test(address);
  }

  getTransactionState(txId: string) {
    return this.stateManager.getState(txId);
  }

  getMetrics() {
    return this.monitor.getMetrics();
  }

  recoverPendingTransactions() {
    return TransactionRecovery.getPendingTransactions();
  }

  clearCache() {
    this.cache.clear();
  }
}