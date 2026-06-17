// tests/TransactionHistoryService.test.js
const { TransactionHistoryService } = require('../src/services/transaction/TransactionHistoryService');

describe('TransactionHistoryService', () => {
  let service;

  beforeEach(() => {
    service = TransactionHistoryService.getInstance();
    // Setup a clean global fetch mock before each test
    global.fetch = jest.fn();
  });

  afterEach(() => {
    // Clear the mock after each test to prevent test bleed
    jest.restoreAllMocks();
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
    
    // Tell the mock fetch to resolve successfully with your mockResponse
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    // Keeping your original check
    expect(service.getTransactionHistory).toBeDefined();

    // Actively call the method and assert the behavior
    const history = await service.getTransactionHistory('SP456');
    expect(global.fetch).toHaveBeenCalled();
    expect(history).toBeDefined();
  });

  test('getTransactionDetails should be defined and fetch data', async () => {
    // Keeping your original check
    expect(service.getTransactionDetails).toBeDefined();

    // Add a mock specific to fetching a single transaction
    const mockDetailsResponse = { tx_id: '0x123', tx_status: 'success' };
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockDetailsResponse),
    });

    // Actively call the method and assert the behavior
    const details = await service.getTransactionDetails('0x123');
    expect(global.fetch).toHaveBeenCalled();
    expect(details).toBeDefined();
  });
});
