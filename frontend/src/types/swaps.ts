/**
 * Swap types and interfaces
 */

export interface TokenInfo {
  symbol: string;
  name?: string;
  contractAddress?: string; // SIP-010 token contract identifier
  decimals?: number;
}

export interface SwapQuote {
  fromToken: TokenInfo;
  toToken: TokenInfo;
  fromAmount: string; // in smallest unit
  toAmount: string; // estimated out
  priceImpact?: number;
  fees?: string; // in smallest unit
  route?: string[]; // protocol hops
}

export interface SwapRequest {
  fromToken: TokenInfo;
  toToken: TokenInfo;
  fromAmount: string;
  slippageTolerance: number; // percent (e.g., 0.5)
  deadline?: number; // unix ms
}

export interface SwapResult {
  success: boolean;
  txHash?: string;
  error?: string;
}
