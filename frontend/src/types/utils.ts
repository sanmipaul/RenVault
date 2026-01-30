/**
 * Type definitions for utility functions
 */

/**
 * Generic result type for operations that can fail
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Async result type
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

/**
 * Nullable type helper
 */
export type Nullable<T> = T | null;

/**
 * Optional type helper
 */
export type Optional<T> = T | undefined;

/**
 * Make specific properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Deep partial type
 */
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

/**
 * Deep readonly type
 */
export type DeepReadonly<T> = T extends object ? {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
} : T;

/**
 * Extract keys of a specific type
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Validator function type
 */
export type ValidatorFn<T> = (value: T) => ValidationResult;

/**
 * Async validator function type
 */
export type AsyncValidatorFn<T> = (value: T) => Promise<ValidationResult>;

/**
 * Debounce options
 */
export interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

/**
 * Throttle options
 */
export interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

/**
 * Retry options for async operations
 */
export interface RetryOptions {
  maxRetries: number;
  delay: number;
  backoff?: 'linear' | 'exponential';
  maxDelay?: number;
  retryCondition?: (error: Error) => boolean;
}

/**
 * Cache options
 */
export interface CacheOptions {
  ttl: number;
  maxSize?: number;
  staleWhileRevalidate?: boolean;
}

/**
 * Cache entry
 */
export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Event handler types
 */
export type EventHandler<E = Event> = (event: E) => void;
export type AsyncEventHandler<E = Event> = (event: E) => Promise<void>;

/**
 * Callback types
 */
export type VoidCallback = () => void;
export type AsyncVoidCallback = () => Promise<void>;
export type Callback<T> = (value: T) => void;
export type AsyncCallback<T> = (value: T) => Promise<void>;

/**
 * Comparator function type
 */
export type Comparator<T> = (a: T, b: T) => number;

/**
 * Predicate function type
 */
export type Predicate<T> = (value: T) => boolean;

/**
 * Async predicate function type
 */
export type AsyncPredicate<T> = (value: T) => Promise<boolean>;

/**
 * Mapper function type
 */
export type Mapper<T, R> = (value: T) => R;

/**
 * Async mapper function type
 */
export type AsyncMapper<T, R> = (value: T) => Promise<R>;

/**
 * Reducer function type
 */
export type Reducer<T, A> = (accumulator: A, value: T) => A;

/**
 * Format options for numbers
 */
export interface NumberFormatOptions {
  decimals?: number;
  thousandsSeparator?: string;
  decimalSeparator?: string;
  prefix?: string;
  suffix?: string;
}

/**
 * Format options for dates
 */
export interface DateFormatOptions {
  format?: string;
  locale?: string;
  timezone?: string;
}

/**
 * Address format options
 */
export interface AddressFormatOptions {
  startChars?: number;
  endChars?: number;
  separator?: string;
}

/**
 * Pagination params
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter params
 */
export interface FilterParams {
  [key: string]: string | number | boolean | string[] | number[] | undefined;
}

/**
 * Search params
 */
export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: FilterParams;
}

/**
 * Time range
 */
export interface TimeRange {
  start: Date;
  end: Date;
}

/**
 * Coordinate point
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Size dimensions
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * Rectangle bounds
 */
export interface Rect extends Point, Size {}

/**
 * Color representation
 */
export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

/**
 * HSL color representation
 */
export interface HSLColor {
  h: number;
  s: number;
  l: number;
  a?: number;
}

/**
 * Environment configuration
 */
export interface EnvConfig {
  apiUrl: string;
  wsUrl: string;
  network: 'mainnet' | 'testnet' | 'devnet';
  debug: boolean;
  version: string;
}

/**
 * Feature flags
 */
export interface FeatureFlags {
  [feature: string]: boolean;
}

/**
 * Logger level
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Log entry
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}
