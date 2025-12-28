import { batchSigningService } from '../services/signing/batch-signing';
import { eip712SigningService } from '../services/signing/eip712-signing';
import { messageSigningService } from '../services/signing/message-signing';
import { hardwareWalletSigningService } from '../services/signing/hardware-wallet-signing';
import { signatureVerificationService } from '../services/signing/signature-verification';

describe('Signing Integration Tests', () => {
  jest.setTimeout(20000);

  test('batch signing returns correct shape', async () => {
    const req = {
      transactions: [
        { id: 'tx1', data: '0xdeadbeef' },
        { id: 'tx2', data: '0xcafebabe' },
      ],
      chainId: 'stacks:1',
      topic: 'test-topic',
    } as any;

    const resp = await batchSigningService.signBatch(req);
    expect(resp).toHaveProperty('batchId');
    expect(resp).toHaveProperty('signatures');
    expect(Array.isArray(resp.signatures)).toBe(true);
  });

  test('EIP-712 signing returns a typed data signature', async () => {
    const typedData = {
      types: {
        EIP712Domain: [{ name: 'name', type: 'string' }],
        Person: [{ name: 'name', type: 'string' }, { name: 'wallet', type: 'address' }],
      },
      primaryType: 'Person',
      domain: { name: 'RenVault', chainId: 1 },
      message: { name: 'Alice', wallet: '0x0000000000000000000000000000000000000000' },
    } as any;

    const req = { typedData, account: '0x0000000000000000000000000000000000000000', topic: 't' };
    const resp = await eip712SigningService.signTypedData(req);
    expect(resp).toHaveProperty('signature');
    expect(resp.signature.startsWith('0x')).toBe(true);
  });

  test('message signing returns signature and hash', async () => {
    const req = { message: 'Hello, RenVault!', account: '0x0000000000000000000000000000000000000000' };
    const resp = await messageSigningService.signMessage(req as any);
    expect(resp).toHaveProperty('signature');
    expect(resp).toHaveProperty('messageHash');
  });

  test('hardware wallet signing returns a signature object', async () => {
    const hwReq = {
      id: 'hw1',
      type: 'transaction',
      data: '0xabc',
      chainId: 'stacks:1',
      hardware: { type: 'ledger', derivationPath: "m/44'/60'/0'/0/0", confirmationRequired: false },
    } as any;

    const resp = await hardwareWalletSigningService.signWithHardware(hwReq as any);
    expect(resp).toHaveProperty('signature');
    expect(resp.signature.startsWith('0x')).toBe(true);
  });

  test('signature verification returns boolean', async () => {
    const sig = '0x' + '00'.repeat(65);
    const req = { message: 'hi', signature: sig, publicKey: '0xpub' } as any;
    const resp = await signatureVerificationService.verifySignature(req);
    expect(resp).toHaveProperty('isValid');
    expect(typeof resp.isValid).toBe('boolean');
  });
});
