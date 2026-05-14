/**
 * TransactionHistoryService unit tests
 */

import { TransactionHistoryService, TransactionHistoryItem } from '../TransactionHistoryService';
import { AccountsApi, TransactionsApi, Configuration } from '@stacks/blockchain-api-client';

// Mock the API client
jest.mock('@stacks/blockchain-api-client', () => ({
  AccountsApi: jest.fn(),
  TransactionsApi: jest.fn(),
  Configuration: jest.fn(),
}));

describe('TransactionHistoryService', () => {
  let service: TransactionHistoryService;
  let mockAccountsApi: jest.Mocked<AccountsApi>;
  let mockTransactionsApi: jest.Mocked<TransactionsApi>;

  const mockTransaction = {
    tx_id: '0x1234567890abcdef',
    tx_type: 'token_transfer',
    tx_status: 'success',
    sender_address: 'SP1234567890ABCDEF',
    fee_rate: '1000',
    burn_block_time: 1700000000,
    token_transfer: {
      amount: '1000000',
      recipient_address: 'SP0987654321ZYXWVU',
      memo: 'Test memo',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAccountsApi = {
      getAccountTransactions: jest.fn(),
    } as any;
    mockTransactionsApi = {
      getTransactionById: jest.fn(),
    } as any;

    (AccountsApi as jest.Mock).mockImplementation(() => mockAccountsApi);
    (TransactionsApi as jest.Mock).mockImplementation(() => mockTransactionsApi);

    service = TransactionHistoryService.getInstance('mainnet');
  });

  describe('getInstance', () => {
    it('returns a singleton instance for the same network', () => {
      const instance1 = TransactionHistoryService.getInstance('mainnet');
      const instance2 = TransactionHistoryService.getInstance('mainnet');
      expect(instance1).toBe(instance2);
    });

    it('returns different instances for different networks', () => {
      const mainnetInstance = TransactionHistoryService.getInstance('mainnet');
      const testnetInstance = TransactionHistoryService.getInstance('testnet');
      expect(mainnetInstance).not.toBe(testnetInstance);
    });
  });

  describe('getTransactionHistory', () => {
    it('returns transaction history with correct mapping', async () => {
      mockAccountsApi.getAccountTransactions.mockResolvedValue({
        results: [mockTransaction],
        total: 1,
      });

      const result = await service.getTransactionHistory('SP1234567890ABCDEF');

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].txId).toBe('0x1234567890abcdef');
      expect(result.transactions[0].type).toBe('sent');
      expect(result.transactions[0].amount).toBe(1000000);
      expect(result.transactions[0].status).toBe('success');
    });

    it('marks transaction as received when recipient matches address', async () => {
      mockAccountsApi.getAccountTransactions.mockResolvedValue({
        results: [{ ...mockTransaction, token_transfer: { ...mockTransaction.token_transfer, recipient_address: 'SP1234567890ABCDEF' } }],
        total: 1,
      });

      const result = await service.getTransactionHistory('SP1234567890ABCDEF');
      expect(result.transactions[0].type).toBe('received');
    });

    it('handles contract_call transactions', async () => {
      mockAccountsApi.getAccountTransactions.mockResolvedValue({
        results: [{ ...mockTransaction, tx_type: 'contract_call' }],
        total: 1,
      });

      const result = await service.getTransactionHistory('SP1234567890ABCDEF');
      expect(result.transactions[0].type).toBe('contract_call');
    });

    it('throws error on API failure', async () => {
      mockAccountsApi.getAccountTransactions.mockRejectedValue(new Error('API error'));

      await expect(service.getTransactionHistory('SP1234567890ABCDEF')).rejects.toThrow('Failed to fetch transaction history');
    });
  });

  describe('getTransactionDetails', () => {
    it('returns transaction details', async () => {
      const details = { tx_id: '0x1234567890abcdef', status: 'success' };
      mockTransactionsApi.getTransactionById.mockResolvedValue(details);

      const result = await service.getTransactionDetails('0x1234567890abcdef');
      expect(result).toEqual(details);
    });

    it('throws error on API failure', async () => {
      mockTransactionsApi.getTransactionById.mockRejectedValue(new Error('Not found'));

      await expect(service.getTransactionDetails('invalid-id')).rejects.toThrow('Failed to fetch transaction details');
    });
  });
});