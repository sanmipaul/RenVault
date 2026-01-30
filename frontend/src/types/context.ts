/**
 * Type definitions for React context
 */

import { WalletProviderType, WalletConnectionState, WalletSession } from './walletConnection';
import { TransactionDetails } from './transaction';
import { NotificationPreferences } from './notification';

/**
 * Wallet context state
 */
export interface WalletContextState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  publicKey: string | null;
  network: string | null;
  provider: WalletProviderType | null;
  session: WalletSession | null;
  error: string | null;
}

/**
 * Wallet context actions
 */
export interface WalletContextActions {
  connect: (provider: WalletProviderType) => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: (network: string) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  signTransaction: (tx: unknown) => Promise<string>;
  clearError: () => void;
}

/**
 * Complete wallet context type
 */
export interface WalletContextType extends WalletContextState, WalletContextActions {}

/**
 * Theme context state
 */
export interface ThemeContextState {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  accentColor: string;
}

/**
 * Theme context actions
 */
export interface ThemeContextActions {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAccentColor: (color: string) => void;
  toggleTheme: () => void;
}

/**
 * Complete theme context type
 */
export interface ThemeContextType extends ThemeContextState, ThemeContextActions {}

/**
 * Transaction context state
 */
export interface TransactionContextState {
  pendingTransactions: TransactionDetails[];
  recentTransactions: TransactionDetails[];
  isProcessing: boolean;
  currentTxId: string | null;
}

/**
 * Transaction context actions
 */
export interface TransactionContextActions {
  submitTransaction: (tx: unknown) => Promise<string>;
  cancelTransaction: (txId: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  getTransactionStatus: (txId: string) => TransactionDetails | null;
}

/**
 * Complete transaction context type
 */
export interface TransactionContextType extends TransactionContextState, TransactionContextActions {}

/**
 * User context state
 */
export interface UserContextState {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  displayName: string | null;
  preferences: UserPreferences | null;
  isLoading: boolean;
}

/**
 * User preferences
 */
export interface UserPreferences {
  notifications: NotificationPreferences;
  display: DisplayPreferences;
  security: SecurityPreferences;
}

/**
 * Display preferences
 */
export interface DisplayPreferences {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  language: string;
  compactMode: boolean;
}

/**
 * Security preferences
 */
export interface SecurityPreferences {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  trustedDevicesOnly: boolean;
}

/**
 * User context actions
 */
export interface UserContextActions {
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Complete user context type
 */
export interface UserContextType extends UserContextState, UserContextActions {}

/**
 * App context state (global app state)
 */
export interface AppContextState {
  isInitialized: boolean;
  isOnline: boolean;
  networkStatus: 'connected' | 'disconnected' | 'connecting';
  version: string;
  environment: 'development' | 'staging' | 'production';
}

/**
 * App context actions
 */
export interface AppContextActions {
  initialize: () => Promise<void>;
  checkNetworkStatus: () => Promise<void>;
}

/**
 * Complete app context type
 */
export interface AppContextType extends AppContextState, AppContextActions {}

/**
 * Modal context state
 */
export interface ModalContextState {
  isOpen: boolean;
  modalType: string | null;
  modalProps: Record<string, unknown>;
}

/**
 * Modal context actions
 */
export interface ModalContextActions {
  openModal: (type: string, props?: Record<string, unknown>) => void;
  closeModal: () => void;
}

/**
 * Complete modal context type
 */
export interface ModalContextType extends ModalContextState, ModalContextActions {}
