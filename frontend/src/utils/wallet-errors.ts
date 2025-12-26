export enum WalletErrorCode {
  // Connection related errors
  CONNECTION_REFUSED = 'WALLET_CONNECTION_REFUSED',
  CONNECTION_TIMEOUT = 'WALLET_CONNECTION_TIMEOUT',
  NETWORK_ERROR = 'WALLET_NETWORK_ERROR',
  SESSION_DISCONNECTED = 'WALLET_SESSION_DISCONNECTED',
  
  // User action errors
  USER_REJECTED = 'USER_REJECTED',
  USER_REJECTED_CHAIN_SWITCH = 'USER_REJECTED_CHAIN_SWITCH',
  
  // Chain/Network errors
  UNSUPPORTED_CHAIN = 'UNSUPPORTED_CHAIN',
  CHAIN_MISMATCH = 'CHAIN_MISMATCH',
  
  // Request errors
  INVALID_REQUEST = 'INVALID_REQUEST',
  METHOD_NOT_SUPPORTED = 'METHOD_NOT_SUPPORTED',
  
  // Session errors
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  
  // General errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  WALLET_INIT_FAILED = 'WALLET_INIT_FAILED',
}

export class WalletError extends Error {
  constructor(
    public code: WalletErrorCode,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'WalletError';
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WalletError);
    }
  }

  static fromError(error: unknown, fallbackCode = WalletErrorCode.UNKNOWN_ERROR): WalletError {
    if (error instanceof WalletError) return error;
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
        ? error 
        : 'An unknown wallet error occurred';
    
    return new WalletError(fallbackCode, errorMessage, error);
  }
}

export const getFriendlyErrorMessage = (error: unknown): string => {
  const walletError = error instanceof WalletError 
    ? error 
    : WalletError.fromError(error);
  
  switch (walletError.code) {
    case WalletErrorCode.CONNECTION_REFUSED:
      return 'The wallet connection was refused. Please try again or use a different wallet.';
      
    case WalletErrorCode.CONNECTION_TIMEOUT:
      return 'The wallet connection timed out. Please check your internet connection and try again.';
      
    case WalletErrorCode.NETWORK_ERROR:
      return 'A network error occurred. Please check your internet connection and try again.';
      
    case WalletErrorCode.SESSION_DISCONNECTED:
      return 'Your wallet session has been disconnected. Please reconnect your wallet.';
      
    case WalletErrorCode.USER_REJECTED:
    case WalletErrorCode.USER_REJECTED_CHAIN_SWITCH:
      return 'The request was rejected by the user.';
      
    case WalletErrorCode.UNSUPPORTED_CHAIN:
      return 'The selected network is not supported. Please switch to a supported network.';
      
    case WalletErrorCode.CHAIN_MISMATCH:
      return 'The connected wallet is on a different network. Please switch to the correct network in your wallet.';
      
    case WalletErrorCode.SESSION_EXPIRED:
      return 'Your wallet session has expired. Please reconnect your wallet.';
      
    case WalletErrorCode.WALLET_NOT_FOUND:
      return 'No wallet was found. Please install a compatible wallet and try again.';
      
    case WalletErrorCode.WALLET_INIT_FAILED:
      return 'Failed to initialize the wallet. Please try again or contact support if the issue persists.';
      
    case WalletErrorCode.INVALID_REQUEST:
    case WalletErrorCode.METHOD_NOT_SUPPORTED:
      return 'The requested operation is not supported. Please try a different action.';
      
    case WalletErrorCode.UNKNOWN_ERROR:
    default:
      return walletError.message || 'An unexpected error occurred. Please try again.';
  }
};

export const isUserRejectedError = (error: unknown): boolean => {
  if (!error) return false;
  
  // Check if it's a WalletError with a user rejection code
  if (error instanceof WalletError) {
    return [
      WalletErrorCode.USER_REJECTED,
      WalletErrorCode.USER_REJECTED_CHAIN_SWITCH
    ].includes(error.code);
  }
  
  // Check for common user rejection messages in the error
  const errorMessage = error instanceof Error 
    ? error.message 
    : String(error);
    
  return [
    'user rejected',
    'user cancelled',
    'user denied',
    'request rejected',
    'request denied',
    'user closed modal',
    'rejected by user',
    'cancelled by user',
    'denied by user'
  ].some(term => errorMessage.toLowerCase().includes(term));
};

export const isNetworkError = (error: unknown): boolean => {
  if (!error) return false;
  
  if (error instanceof WalletError) {
    return [
      WalletErrorCode.NETWORK_ERROR,
      WalletErrorCode.CONNECTION_TIMEOUT,
      WalletErrorCode.CONNECTION_REFUSED
    ].includes(error.code);
  }
  
  const errorMessage = error instanceof Error 
    ? error.message 
    : String(error);
    
  return [
    'network error',
    'connection error',
    'failed to fetch',
    'network request failed',
    'connection refused',
    'connection reset',
    'connection closed',
    'timeout',
    'timed out',
    'offline',
    'no internet',
    'no connection',
    'econnrefused',
    'econnreset',
    'enetunreach',
    'enotfound',
    'eai_again',
    'eai_again',
    'econnaborted'
  ].some(term => errorMessage.toLowerCase().includes(term));
};
