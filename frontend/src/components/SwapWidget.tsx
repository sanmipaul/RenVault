import React, { useState } from 'react';
import { TokenInfo, SwapRequest } from '../types/swaps';
import { swapService } from '../services/swap/swap-service';
import { priceFeedService } from '../services/swap/price-feed';
import '../styles/swap.css';

const DEFAULT_TOKENS: TokenInfo[] = [
  { symbol: 'STX', name: 'Stacks' },
];

const SwapWidget: React.FC = () => {
  const [fromToken, setFromToken] = useState<TokenInfo>(DEFAULT_TOKENS[0]);
  const [toToken, setToToken] = useState<TokenInfo>(DEFAULT_TOKENS[0]);
  const [amount, setAmount] = useState<string>('');
  const [slippage, setSlippage] = useState<number>(0.5);
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const fetchQuote = async () => {
    if (!amount) return;
    const req: SwapRequest = { fromToken, toToken, fromAmount: amount, slippageTolerance: slippage };
    setLoading(true);
    try {
      const q = await swapService.getQuote(req);
      setQuote(q);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    const req: SwapRequest = { fromToken, toToken, fromAmount: amount, slippageTolerance: slippage };
    setLoading(true);
    setResult(null);
    try {
      const res = await swapService.executeSwap(req);
      if (res.success) setResult(`Swap executed: ${res.txHash}`);
      else setResult(`Swap failed: ${res.error}`);
    } catch (err) {
      setResult('Swap failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="swap-widget">
      <h4>Token Swap</h4>
      <div className="swap-row">
        <label>From</label>
        <select value={fromToken.symbol} onChange={(e) => setFromToken(DEFAULT_TOKENS.find(t => t.symbol === e.target.value) || DEFAULT_TOKENS[0])}>
          {DEFAULT_TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
        </select>
      </div>
      <div className="swap-row">
        <label>To</label>
        <select value={toToken.symbol} onChange={(e) => setToToken(DEFAULT_TOKENS.find(t => t.symbol === e.target.value) || DEFAULT_TOKENS[0])}>
          {DEFAULT_TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
        </select>
      </div>
      <div className="swap-row">
        <label>Amount</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <div className="swap-row">
        <label>Slippage (%)</label>
        <input type="number" value={slippage} onChange={(e) => setSlippage(Number(e.target.value))} step="0.1" />
      </div>
      <div className="swap-actions">
        <button onClick={fetchQuote} disabled={loading || !amount}>Get Quote</button>
        <button onClick={handleSwap} disabled={loading || !amount}>Swap</button>
      </div>
      {quote && (
        <div className="swap-quote">
          <div>Estimated Out: {quote.toAmount}</div>
          <div>Fees: {quote.fees}</div>
          <div>Price Impact: {quote.priceImpact}%</div>
        </div>
      )}
      {result && <div className="swap-result">{result}</div>}
    </div>
  );
};

export default SwapWidget;
