// services/transaction/TransactionService.ts
import { WalletManager } from '../wallet/WalletManager';
import { WalletError, WalletErrorCode } from '../../utils/wallet-errors';
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
      // Validate amount
      if (amount <= 0) {
        throw new WalletError(
          WalletErrorCode.INVALID_TRANSACTION,
          'Deposit amount must be greater than 0'
        );
      }

      // Validate amount is not too large (prevent overflow)
      if (amount > 1000000) { // 1M STX limit
        throw new WalletError(
          WalletErrorCode.INVALID_TRANSACTION,
          'Deposit amount cannot exceed 1,000,000 STX'
        );
      }

      // Validate contract address format
      if (!this.isValidStacksAddress(contractAddress)) {
        throw new WalletError(
          WalletErrorCode.INVALID_TRANSACTION,
          'Invalid contract address format'
        );
      }

      // Convert amount to microSTX (Stacks uses microSTX)
      const microAmount = Math.floor(amount * 1000000);

      const details: TransactionDetails = {
        contractAddress,
        contractName: 'ren-vault',
        functionName: 'deposit',
        functionArgs: [uintCV(microAmount)],
        amount: microAmount,
        fee: isSponsored ? 0 : 1000, // Zero fee if sponsored
        network: 'mainnet',
        isSponsored,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow
      };

      return details;
    } catch (error) {
      throw new WalletError(
        WalletErrorCode.TRANSACTION_PREPARATION_FAILED,
        `Failed to prepare deposit transaction: ${error.message}`
      );
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
    try {
      console.log('Broadcasting transaction to Stacks network:', signedTx);

      // Broadcast the transaction using Stacks.js
      const broadcastResponse = await broadcastTransaction({
        transaction: signedTx.signedTx,
        network: this.network
      });

      if (broadcastResponse.error) {
        throw new Error(broadcastResponse.error);
      }

      const txId = broadcastResponse.txid || signedTx.txId;
      console.log('Transaction broadcast successful, txId:', txId);

      return txId;
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

  getNetwork(): StacksMainnet {
    return this.network;
  }

  private isValidStacksAddress(address: string): boolean {
    // Basic Stacks address validation
    // Stacks addresses start with SP, SM, or ST and are 28-30 characters long
    const stacksAddressRegex = /^(SP|SM|ST)[0-9A-Z]{26,28}$/;
    return stacksAddressRegex.test(address);
  }
}