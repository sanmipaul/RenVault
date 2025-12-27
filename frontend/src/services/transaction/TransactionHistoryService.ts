// services/transaction/TransactionHistoryService.ts
import { AccountsApi, TransactionsApi, Configuration } from '@stacks/blockchain-api-client';

export interface TransactionHistoryItem {
  txId: string;
  type: 'sent' | 'received' | 'contract_call';
  amount?: number;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
  to?: string;
  from?: string;
  fee: number;
  memo?: string;
}

export class TransactionHistoryService {
  private static instance: TransactionHistoryService;
  private accountsApi: AccountsApi;
  private transactionsApi: TransactionsApi;

  private constructor() {
    const config = new Configuration({
      basePath: 'https://api.mainnet.hiro.so', // or testnet
    });
    this.accountsApi = new AccountsApi(config);
    this.transactionsApi = new TransactionsApi(config);
  }

  static getInstance(): TransactionHistoryService {
    if (!TransactionHistoryService.instance) {
      TransactionHistoryService.instance = new TransactionHistoryService();
    }
    return TransactionHistoryService.instance;
  }

  async getTransactionHistory(address: string, limit = 50, offset = 0): Promise<{ transactions: TransactionHistoryItem[], total: number }> {
    try {
      const response = await this.accountsApi.getAccountTransactions({
        principal: address,
        limit,
        offset,
      });

      const transactions = response.results.map(tx => ({
        txId: tx.tx_id,
        type: this.getTransactionType(tx),
        amount: tx.tx_type === 'token_transfer' ? parseInt(tx.token_transfer.amount) : undefined,
        timestamp: tx.burn_block_time,
        status: tx.tx_status === 'success' ? 'success' : tx.tx_status === 'pending' ? 'pending' : 'failed',
        to: tx.tx_type === 'token_transfer' ? tx.token_transfer.recipient_address : undefined,
        from: tx.sender_address,
        fee: parseInt(tx.fee_rate),
        memo: tx.tx_type === 'token_transfer' ? tx.token_transfer.memo : undefined,
      }));

      return {
        transactions,
        total: response.total || response.results.length, // Assuming API provides total
      };
    } catch (error) {
      throw new Error('Failed to fetch transaction history: ' + error.message);
    }
  }

  private getTransactionType(tx: any): 'sent' | 'received' | 'contract_call' {
    if (tx.tx_type === 'token_transfer') {
      return 'sent'; // Simplified, could check if recipient is self
    }
    if (tx.tx_type === 'contract_call') {
      return 'contract_call';
    }
    return 'received';
  }

  async getTransactionDetails(txId: string): Promise<any> {
    try {
      const response = await this.transactionsApi.getTransactionById({
        txId,
      });
      return response;
    } catch (error) {
      throw new Error('Failed to fetch transaction details: ' + error.message);
    }
  }
}