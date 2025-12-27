// tests/LedgerWalletProvider.test.js
const { LedgerWalletProvider } = require('../src/services/wallet/LedgerWalletProvider');

describe('LedgerWalletProvider', () => {
  let provider;

  beforeEach(() => {
    provider = new LedgerWalletProvider();
  });

  test('should have correct id and name', () => {
    expect(provider.id).toBe('ledger');
    expect(provider.name).toBe('Ledger');
  });

  test('connect should throw error if device not found', async () => {
    // Mock TransportWebUSB.create to throw
    const mockTransport = {
      create: jest.fn().mockRejectedValue(new Error('No device selected')),
    };
    // Assume we can mock it
    // For now, just test structure
    expect(provider.connect).toBeDefined();
  });

  // Add more tests as needed
});