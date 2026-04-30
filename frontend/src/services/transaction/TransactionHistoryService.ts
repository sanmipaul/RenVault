// services/transaction/TransactionHistoryService.ts
import { AccountsApi, TransactionsApi, Configuration } from '@stacks/blockchain-api-client';

interface StacksApiTransaction {
  tx_id: string;
  tx_type: string;
  tx_status: string;
  sender_address: string;
  fee_rate: string;
  burn_block_time: number;
  sponsor_address?: string;
  token_transfer?: {
    amount: string;
    recipient_address: string;
    memo?: string;
  };
}

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
  isSponsored?: boolean;
}

const NETWORK_BASE_URLS: Record<string, string> = {
  mainnet: 'https://api.mainnet.hiro.so',
  testnet: 'https://api.testnet.hiro.so',
};

export class TransactionHistoryService {
  private static instance: TransactionHistoryService;
  private accountsApi: AccountsApi;
  private transactionsApi: TransactionsApi;
  private network: string;

  private constructor(network: 'mainnet' | 'testnet' = 'mainnet') {
    this.network = network;
    const basePath = NETWORK_BASE_URLS[network] ?? NETWORK_BASE_URLS.mainnet;
    const config = new Configuration({ basePath });
    this.accountsApi = new AccountsApi(config);
    this.transactionsApi = new TransactionsApi(config);
  }

  static getInstance(network: 'mainnet' | 'testnet' = 'mainnet'): TransactionHistoryService {
    if (!TransactionHistoryService.instance || TransactionHistoryService.instance.network !== network) {
      TransactionHistoryService.instance = new TransactionHistoryService(network);
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

      const transactions = response.results.map((tx: StacksApiTransaction) => ({
        txId: tx.tx_id,
        type: this.getTransactionType(tx, address),
        amount: tx.tx_type === 'token_transfer' ? parseInt(tx.token_transfer.amount) : undefined,
        timestamp: tx.burn_block_time,
        status: (tx.tx_status === 'success' ? 'success' : tx.tx_status === 'pending' ? 'pending' : 'failed') as 'pending' | 'success' | 'failed',
        to: tx.tx_type === 'token_transfer' ? tx.token_transfer.recipient_address : undefined,
        from: tx.sender_address,
        fee: parseInt(tx.fee_rate),
        memo: tx.tx_type === 'token_transfer' ? tx.token_transfer.memo : undefined,
        isSponsored: !!tx.sponsor_address,
      }));

      return {
        transactions,
        total: response.total || response.results.length, // Assuming API provides total
      };
    } catch (error) {
      throw new Error('Failed to fetch transaction history: ' + (error as Error).message);
    }
  }

  private getTransactionType(tx: StacksApiTransaction, currentAddress: string): 'sent' | 'received' | 'contract_call' {
    if (tx.tx_type === 'token_transfer') {
      const recipient = tx.token_transfer?.recipient_address;
      return recipient === currentAddress ? 'received' : 'sent';
    }
    if (tx.tx_type === 'contract_call') {
      return 'contract_call';
    }
    return 'received';
  }

  async getTransactionDetails(txId: string): Promise<unknown> {
    try {
      const response = await this.transactionsApi.getTransactionById({
        txId,
      });
      return response;
    } catch (error) {
      throw new Error('Failed to fetch transaction details: ' + (error as Error).message);
    }
  }
}