// tests/TrezorWalletProvider.test.js
const { TrezorWalletProvider } = require('../src/services/wallet/TrezorWalletProvider');

describe('TrezorWalletProvider', () => {
  let provider;

  beforeEach(() => {
    provider = new TrezorWalletProvider();
  });

  test('should have correct id and name', () => {
    expect(provider.id).toBe('trezor');
    expect(provider.name).toBe('Trezor');
  });

  test('connect should be defined', () => {
    expect(provider.connect).toBeDefined();
  });

  test('signTransaction should be defined', () => {
    expect(provider.signTransaction).toBeDefined();
  });

  // Add more tests
});