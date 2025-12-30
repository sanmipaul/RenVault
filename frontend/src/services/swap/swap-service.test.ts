import { swapService } from './swap-service';
import { TokenInfo } from '../../types/swaps';

describe('SwapService', () => {
  it('returns a quote and executes swap (simulated)', async () => {
    const from: TokenInfo = { symbol: 'STX' };
    const to: TokenInfo = { symbol: 'STX' };
    const req = { fromToken: from, toToken: to, fromAmount: '1000000', slippageTolerance: 0.5 } as any;

    const quote = await swapService.getQuote(req);
    expect(quote.fromAmount).toBe(req.fromAmount);

    const res = await swapService.executeSwap(req);
    expect(res.success).toBe(true);
    expect(res.txHash).toBeDefined();
  });
});
