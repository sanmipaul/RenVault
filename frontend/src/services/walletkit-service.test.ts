import { WalletKitService } from './walletkit-service';
import { CoreService } from './core-service';
import { WalletKit } from '@reown/walletkit';

jest.mock('@reown/walletkit');
jest.mock('./core-service');
jest.mock('@walletconnect/utils', () => ({
  buildApprovedNamespaces: jest.fn(() => ({})),
  getSdkError: jest.fn(() => ({ code: 5000, message: 'User rejected' })),
}));

describe('WalletKitService', () => {
  let mockWalletKit: any;
  let mockCore: any;

  beforeEach(() => {
    jest.clearAllMocks();
    WalletKitService.reset();
    
    mockCore = {};
    (CoreService.getInstance as jest.Mock).mockReturnValue(mockCore);

    mockWalletKit = {
      approveSession: jest.fn(),
      rejectSession: jest.fn(),
      respondSessionRequest: jest.fn(),
      getActiveSessions: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
    };
    (WalletKit.init as jest.Mock).mockResolvedValue(mockWalletKit);
  });

  it('should initialize successfully', async () => {
    const service = await WalletKitService.init();
    expect(WalletKit.init).toHaveBeenCalled();
    expect(service).toBeInstanceOf(WalletKitService);
  });

  it('should return singleton instance', async () => {
    const service1 = await WalletKitService.init();
    const service2 = await WalletKitService.init();
    expect(service1).toBe(service2);
  });

  it('should approve session', async () => {
    const service = await WalletKitService.init();
    const proposal = { id: 123, params: { requiredNamespaces: {} } } as any;
    const supportedNamespaces = {};

    await service.approveSession(proposal, supportedNamespaces);
    expect(mockWalletKit.approveSession).toHaveBeenCalledWith(expect.objectContaining({
      id: 123
    }));
  });

  it('should reject session', async () => {
    const service = await WalletKitService.init();
    const proposal = { id: 123 } as any;

    await service.rejectSession(proposal);
    expect(mockWalletKit.rejectSession).toHaveBeenCalledWith(expect.objectContaining({
      id: 123,
      reason: expect.objectContaining({ code: 5000 })
    }));
  });

  it('should respond to session request', async () => {
    const service = await WalletKitService.init();
    const topic = 'test-topic';
    const id = 123;
    const result = '0x123';

    await service.respondSessionRequest(topic, id, result);
    expect(mockWalletKit.respondSessionRequest).toHaveBeenCalledWith({
      topic,
      response: {
        id,
        jsonrpc: '2.0',
        result
      }
    });
  });

  it('should reject session request', async () => {
    const service = await WalletKitService.init();
    const topic = 'test-topic';
    const id = 123;
    const error = { code: 5000, message: 'User rejected' };

    await service.rejectSessionRequest(topic, id, error);
    expect(mockWalletKit.respondSessionRequest).toHaveBeenCalledWith({
      topic,
      response: {
        id,
        jsonrpc: '2.0',
        error
      }
    });
  });
});
