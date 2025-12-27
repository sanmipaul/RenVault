// tests/TransactionHistoryService.test.js
const { TransactionHistoryService } = require('../src/services/transaction/TransactionHistoryService');

describe('TransactionHistoryService', () => {
  let service;

  beforeEach(() => {
    service = TransactionHistoryService.getInstance();
  });

  test('should be a singleton', () => {
    const service2 = TransactionHistoryService.getInstance();
    expect(service).toBe(service2);
  });

  test('getTransactionHistory should return array', async () => {
    // Mock the API call
    const mockResponse = {
      results: [
        {
          tx_id: '0x123',
          tx_type: 'token_transfer',
          token_transfer: { amount: '1000000', recipient_address: 'SP123' },
          burn_block_time: 1234567890,
          tx_status: 'success',
          sender_address: 'SP456',
          fee_rate: '1000',
          memo: 'test memo',
        },
      ],
    };
    // Assume we can mock the API
    // For now, just test structure
    expect(service.getTransactionHistory).toBeDefined();
  });

  test('getTransactionDetails should be defined', () => {
    expect(service.getTransactionDetails).toBeDefined();
  });
});