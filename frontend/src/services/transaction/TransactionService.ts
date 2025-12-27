// services/transaction/TransactionService.ts
import { WalletManager } from '../wallet/WalletManager';
import { WalletError, WalletErrorCode } from '../../utils/wallet-errors';

export interface TransactionDetails {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: any[];
  amount?: number;
  fee?: number;
  network?: string;
}

export interface SignedTransaction {
  txId: string;
  signedTx: any;
  details: TransactionDetails;
}

export class TransactionService {
  private static instance: TransactionService;
  private walletManager: WalletManager;

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
    contractAddress: string = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.ren-vault'
  ): Promise<TransactionDetails> {
    // Convert amount to microSTX (Stacks uses microSTX)
    const microAmount = Math.floor(amount * 1000000);

    const details: TransactionDetails = {
      contractAddress,
      contractName: 'ren-vault',
      functionName: 'deposit',
      functionArgs: [microAmount],
      amount: microAmount,
      fee: 1000, // Default fee in microSTX
      network: 'mainnet'
    };

    return details;
  }

  async signDepositTransaction(details: TransactionDetails): Promise<SignedTransaction> {
    try {
      if (!this.walletManager.isConnected()) {
        throw new WalletError(
          WalletErrorCode.WALLET_NOT_CONNECTED,
          'Wallet not connected'
        );
      }

      // Create the transaction object for Stacks
      const tx = {
        contractAddress: details.contractAddress,
        contractName: details.contractName,
        functionName: details.functionName,
        functionArgs: details.functionArgs,
        network: details.network
      };

      // Sign the transaction using the current wallet provider
      const signedTx = await this.walletManager.signTransaction(tx);

      const signedTransaction: SignedTransaction = {
        txId: this.generateTxId(),
        signedTx,
        details
      };

      return signedTransaction;
    } catch (error) {
      console.error('Transaction signing failed:', error);
      throw new WalletError(
        WalletErrorCode.TRANSACTION_SIGNING_FAILED,
        `Failed to sign transaction: ${error.message}`
      );
    }
  }

  async broadcastTransaction(signedTx: SignedTransaction): Promise<string> {
    try {
      // In a real implementation, this would broadcast to the Stacks network
      // For now, we'll simulate the broadcast
      console.log('Broadcasting transaction:', signedTx);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return signedTx.txId;
    } catch (error) {
      console.error('Transaction broadcast failed:', error);
      throw new WalletError(
        WalletErrorCode.TRANSACTION_BROADCAST_FAILED,
        `Failed to broadcast transaction: ${error.message}`
      );
    }
  }

  private generateTxId(): string {
    return '0x' + Math.random().toString(16).substr(2, 64);
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
}