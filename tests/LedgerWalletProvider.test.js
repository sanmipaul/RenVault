// tests/LedgerWalletProvider.test.js
const { LedgerWalletProvider } = require('../src/services/wallet/LedgerWalletProvider');

// Mock the webusb transport layer so we can control its behavior in the tests
jest.mock('@ledgerhq/hw-transport-webusb', () => ({
  create: jest.fn(),
}));
const TransportWebUSB = require('@ledgerhq/hw-transport-webusb');

describe('LedgerWalletProvider', () => {
  let provider;

  beforeEach(() => {
    provider = new LedgerWalletProvider();
    // Clear mock history between tests to prevent data leakage
    jest.clearAllMocks(); 
  });

  test('should have correct id and name', () => {
    expect(provider.id).toBe('ledger');
    expect(provider.name).toBe('Ledger');
  });

  test('connect should throw error if device not found', async () => {
    // Actively mock the transport to throw the error your comment specified
    TransportWebUSB.create.mockRejectedValue(new Error('No device selected'));

    // Assert that the provider bubbles up the correct error when connect is called
    await expect(provider.connect()).rejects.toThrow('No device selected');
  });
});
