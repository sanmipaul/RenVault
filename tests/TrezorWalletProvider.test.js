// tests/TrezorWalletProvider.test.js
const { TrezorWalletProvider } = require('../src/services/wallet/TrezorWalletProvider');

// Mock the Trezor Connect library so we don't need a physical device for tests
jest.mock('@trezor/connect-web', () => ({
  __esModule: true,
  default: {
    init: jest.fn().mockResolvedValue(),
    getPublicKey: jest.fn(),
    signTransaction: jest.fn(),
  }
}));
const TrezorConnect = require('@trezor/connect-web').default;

describe('TrezorWalletProvider', () => {
  let provider;

  beforeEach(() => {
    provider = new TrezorWalletProvider();
    // Clear mocks before each test so responses don't leak across tests
    jest.clearAllMocks();
  });

  test('should have correct id and name', () => {
    expect(provider.id).toBe('trezor');
    expect(provider.name).toBe('Trezor');
  });

  test('connect should be defined and handle successful connection', async () => {
    // Keeping your original structural check
    expect(provider.connect).toBeDefined();

    // Simulate the user successfully plugging in and unlocking the Trezor
    TrezorConnect.getPublicKey.mockResolvedValue({
      success: true,
      payload: { publicKey: '0xabc123', path: "m/44'/60'/0'/0/0" }
    });

    // Actively assert that connecting does not throw an error
    await expect(provider.connect()).resolves.not.toThrow();
  });

  test('connect should throw error if device connection fails', async () => {
    // Simulate a failure state (e.g., user unplugs device or denies access)
    TrezorConnect.getPublicKey.mockResolvedValue({
      success: false,
      payload: { error: 'Device not found or user cancelled' }
    });

    // Actively assert that the provider surfaces the error
    await expect(provider.connect()).rejects.toThrow();
  });

  test('signTransaction should be defined and process signatures', async () => {
    // Keeping your original structural check
    expect(provider.signTransaction).toBeDefined();

    // Simulate a successful hardware signature
    TrezorConnect.signTransaction.mockResolvedValue({
      success: true,
      payload: { signatures: ['0xsignaturehash'] }
    });

    const mockTx = { to: '0x123', amount: '100' };
    
    // Actively assert that signing resolves correctly
    await expect(provider.signTransaction(mockTx)).resolves.toBeDefined();
  });
});
