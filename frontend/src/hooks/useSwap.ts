import { useState } from 'react';
import { SwapRequest, SwapResult } from '../types/swaps';
import { swapService } from '../services/swap/swap-service';

export const useSwap = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getQuote = async (req: SwapRequest) => {
    setLoading(true);
    try {
      const q = await swapService.getQuote(req);
      setError(null);
      return q;
    } catch (err: any) {
      setError(err?.message || 'Failed to get quote');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const execute = async (req: SwapRequest): Promise<SwapResult> => {
    setLoading(true);
    try {
      const res = await swapService.executeSwap(req);
      setError(null);
      return res;
    } catch (err: any) {
      setError(err?.message || 'Swap failed');
      return { success: false, error: err?.message || 'unknown' };
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, getQuote, execute };
};

export default useSwap;
