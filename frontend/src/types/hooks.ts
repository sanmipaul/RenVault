/**
 * Type definitions for custom hooks
 */

import { WalletProviderType, WalletBalance } from './walletConnection';
import { TransactionDetails, TransactionStatus } from './transaction';

/**
 * useWallet hook return type
 */
export interface UseWalletReturn {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  publicKey: string | null;
  network: string | null;
  provider: WalletProviderType | null;
  balance: WalletBalance | null;
  connect: (provider: WalletProviderType) => Promise<void>;
  disconnect: () => Promise<void>;
  error: string | null;
}

/**
 * useBalance hook return type
 */
export interface UseBalanceReturn {
  balance: WalletBalance | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * useTransaction hook return type
 */
export interface UseTransactionReturn {
  submit: (tx: unknown) => Promise<string>;
  status: TransactionStatus | null;
  txId: string | null;
  isSubmitting: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * useTransactionHistory hook return type
 */
export interface UseTransactionHistoryReturn {
  transactions: TransactionDetails[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * useAsync hook return type
 */
export interface UseAsyncReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  execute: (...args: unknown[]) => Promise<T>;
  reset: () => void;
}

/**
 * useLocalStorage hook return type
 */
export type UseLocalStorageReturn<T> = [
  T,
  (value: T | ((prev: T) => T)) => void,
  () => void
];

/**
 * useDebounce hook return type
 */
export type UseDebounceReturn<T> = T;

/**
 * useThrottle hook return type
 */
export type UseThrottleReturn<T> = T;

/**
 * useMediaQuery hook return type
 */
export type UseMediaQueryReturn = boolean;

/**
 * useOnClickOutside hook options
 */
export interface UseOnClickOutsideOptions {
  enabled?: boolean;
  eventType?: 'mousedown' | 'mouseup' | 'click';
}

/**
 * useInterval hook options
 */
export interface UseIntervalOptions {
  enabled?: boolean;
  immediate?: boolean;
}

/**
 * useClipboard hook return type
 */
export interface UseClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
  reset: () => void;
}

/**
 * useForm hook return type
 */
export interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  handleChange: (field: keyof T) => (value: T[keyof T]) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void>) => (e?: React.FormEvent) => void;
  reset: () => void;
  setFieldValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldError: (field: keyof T, error: string) => void;
}

/**
 * useModal hook return type
 */
export interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * useToggle hook return type
 */
export type UseToggleReturn = [boolean, () => void, (value: boolean) => void];

/**
 * usePrevious hook return type
 */
export type UsePreviousReturn<T> = T | undefined;

/**
 * useNetwork hook return type
 */
export interface UseNetworkReturn {
  isOnline: boolean;
  isOffline: boolean;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
}

/**
 * useCountdown hook return type
 */
export interface UseCountdownReturn {
  count: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

/**
 * usePagination hook return type
 */
export interface UsePaginationReturn {
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
}

/**
 * useSearch hook return type
 */
export interface UseSearchReturn<T> {
  query: string;
  results: T[];
  isSearching: boolean;
  setQuery: (query: string) => void;
  clear: () => void;
}
