/**
 * Type definitions for component props
 */

import { ReactNode, CSSProperties } from 'react';
import { WalletProviderType, WalletBalance, MultiSigConfig, CoSigner } from './walletConnection';
import { TransactionDetails, TransactionStatus } from './transaction';
import { Notification, NotificationPreferences } from './notification';

/**
 * Common props shared by many components
 */
export interface BaseComponentProps {
  className?: string;
  style?: CSSProperties;
  testId?: string;
}

/**
 * Props for components that can have children
 */
export interface WithChildrenProps extends BaseComponentProps {
  children?: ReactNode;
}

/**
 * Props for components with loading states
 */
export interface WithLoadingProps {
  isLoading?: boolean;
  loadingText?: string;
}

/**
 * Props for components with error states
 */
export interface WithErrorProps {
  error?: string | null;
  onErrorDismiss?: () => void;
}

/**
 * AddressDisplay component props
 */
export interface AddressDisplayProps extends BaseComponentProps {
  address: string;
  showCopyButton?: boolean;
  truncate?: boolean;
  startChars?: number;
  endChars?: number;
  onCopy?: () => void;
}

/**
 * BalanceDisplay component props
 */
export interface BalanceDisplayProps extends BaseComponentProps, WithLoadingProps {
  balance: WalletBalance | null;
  showTokens?: boolean;
  showNFTs?: boolean;
  decimals?: number;
  currency?: string;
}

/**
 * WalletConnect component props
 */
export interface WalletConnectProps extends BaseComponentProps, WithLoadingProps, WithErrorProps {
  onConnect?: (provider: WalletProviderType) => void;
  onDisconnect?: () => void;
  availableProviders?: WalletProviderType[];
  autoConnect?: boolean;
}

/**
 * WalletConnection component props
 */
export interface WalletConnectionProps extends BaseComponentProps {
  isConnected: boolean;
  address?: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

/**
 * ProviderSelector component props
 */
export interface ProviderSelectorProps extends BaseComponentProps {
  selectedProvider: WalletProviderType | null;
  onSelect: (provider: WalletProviderType) => void;
  availableProviders?: WalletProviderType[];
  disabled?: boolean;
}

/**
 * DepositForm component props
 */
export interface DepositFormProps extends BaseComponentProps, WithLoadingProps, WithErrorProps {
  onSubmit: (amount: string, asset: string) => Promise<void>;
  maxAmount?: string;
  minAmount?: string;
  availableAssets?: string[];
  defaultAsset?: string;
}

/**
 * TransactionHistory component props
 */
export interface TransactionHistoryProps extends BaseComponentProps, WithLoadingProps {
  transactions: TransactionDetails[];
  hasMore?: boolean;
  onLoadMore?: () => void;
  onTransactionClick?: (tx: TransactionDetails) => void;
  emptyMessage?: string;
}

/**
 * TransactionSigner component props
 */
export interface TransactionSignerProps extends BaseComponentProps, WithLoadingProps, WithErrorProps {
  transaction: TransactionDetails | null;
  onSign: () => Promise<void>;
  onCancel: () => void;
  requiresMultiSig?: boolean;
}

/**
 * TransactionSuccess component props
 */
export interface TransactionSuccessProps extends BaseComponentProps {
  txId: string;
  message?: string;
  onClose?: () => void;
  showExplorerLink?: boolean;
}

/**
 * TransactionStatus component props (chain)
 */
export interface TransactionStatusDisplayProps extends BaseComponentProps {
  status: TransactionStatus;
  txId?: string;
  showDetails?: boolean;
}

/**
 * MultiSigSetup component props
 */
export interface MultiSigSetupProps extends BaseComponentProps, WithLoadingProps, WithErrorProps {
  onSetup: (config: MultiSigConfig) => Promise<void>;
  minSigners?: number;
  maxSigners?: number;
}

/**
 * CoSignerManagement component props
 */
export interface CoSignerManagementProps extends BaseComponentProps, WithLoadingProps {
  coSigners: CoSigner[];
  onAdd: (coSigner: CoSigner) => void;
  onRemove: (address: string) => void;
  onEdit: (coSigner: CoSigner) => void;
  maxCoSigners?: number;
}

/**
 * MultiSigTransactionSigner component props
 */
export interface MultiSigTransactionSignerProps extends BaseComponentProps, WithLoadingProps, WithErrorProps {
  transaction: TransactionDetails;
  requiredSignatures: number;
  currentSignatures: number;
  onSign: () => Promise<void>;
  onReject: () => void;
  canSign: boolean;
}

/**
 * NotificationCenter component props
 */
export interface NotificationCenterProps extends BaseComponentProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  onNotificationClick?: (notification: Notification) => void;
  maxVisible?: number;
}

/**
 * NotificationPreferences component props
 */
export interface NotificationPreferencesProps extends BaseComponentProps, WithLoadingProps {
  preferences: NotificationPreferences;
  onSave: (preferences: NotificationPreferences) => Promise<void>;
}

/**
 * SessionStatus component props
 */
export interface SessionStatusProps extends BaseComponentProps {
  isActive: boolean;
  sessionId?: string;
  expiresAt?: Date;
  onExtend?: () => void;
  onEnd?: () => void;
}

/**
 * SessionDashboard component props
 */
export interface SessionDashboardProps extends BaseComponentProps, WithLoadingProps {
  sessions: SessionInfo[];
  onSessionEnd: (sessionId: string) => void;
  onSessionEndAll: () => void;
}

/**
 * Session info for dashboard
 */
export interface SessionInfo {
  id: string;
  deviceName: string;
  ipAddress?: string;
  lastActive: Date;
  createdAt: Date;
  isCurrent: boolean;
}

/**
 * ConnectionStatus component props
 */
export interface ConnectionStatusProps extends BaseComponentProps {
  isConnected: boolean;
  isConnecting?: boolean;
  networkName?: string;
  onReconnect?: () => void;
}

/**
 * AutoReconnect component props
 */
export interface AutoReconnectProps extends BaseComponentProps {
  enabled: boolean;
  maxAttempts?: number;
  delay?: number;
  onReconnect?: () => void;
  onMaxAttemptsReached?: () => void;
}

/**
 * HardwareWalletConnector component props
 */
export interface HardwareWalletConnectorProps extends BaseComponentProps, WithLoadingProps, WithErrorProps {
  onConnect: (type: 'ledger' | 'trezor') => Promise<void>;
  supportedDevices?: ('ledger' | 'trezor')[];
}

/**
 * WalletBackup component props
 */
export interface WalletBackupProps extends BaseComponentProps, WithLoadingProps, WithErrorProps {
  onBackup: () => Promise<void>;
  lastBackupDate?: Date;
  autoBackupEnabled?: boolean;
  onAutoBackupToggle?: (enabled: boolean) => void;
}

/**
 * WalletRecovery component props
 */
export interface WalletRecoveryProps extends BaseComponentProps, WithLoadingProps, WithErrorProps {
  onRecover: (backupData: string, password: string) => Promise<void>;
}

/**
 * BackupCodes component props
 */
export interface BackupCodesProps extends BaseComponentProps {
  codes: string[];
  onRegenerateRequest?: () => void;
  showCopyAll?: boolean;
}

/**
 * TwoFactorAuthSetup component props
 */
export interface TwoFactorAuthSetupProps extends BaseComponentProps, WithLoadingProps, WithErrorProps {
  qrCodeUrl?: string;
  secret?: string;
  onVerify: (code: string) => Promise<void>;
  onCancel: () => void;
}

/**
 * TwoFactorAuthVerify component props
 */
export interface TwoFactorAuthVerifyProps extends BaseComponentProps, WithLoadingProps, WithErrorProps {
  onVerify: (code: string) => Promise<void>;
  onUseBackupCode?: () => void;
}

/**
 * Analytics component props
 */
export interface AnalyticsProps extends BaseComponentProps, WithLoadingProps {
  data: AnalyticsData;
  timeRange?: 'day' | 'week' | 'month' | 'year';
  onTimeRangeChange?: (range: 'day' | 'week' | 'month' | 'year') => void;
}

/**
 * Analytics data structure
 */
export interface AnalyticsData {
  totalDeposits: string;
  totalWithdrawals: string;
  transactionCount: number;
  uniqueAssets: number;
  chartData?: ChartDataPoint[];
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

/**
 * PerformanceMonitor component props
 */
export interface PerformanceMonitorProps extends BaseComponentProps {
  metrics: PerformanceMetrics;
  showDetails?: boolean;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  fps?: number;
  memoryUsage?: number;
  loadTime?: number;
  apiLatency?: number;
}

/**
 * ChainSelector component props
 */
export interface ChainSelectorProps extends BaseComponentProps {
  selectedChain: string;
  availableChains: ChainInfo[];
  onSelect: (chainId: string) => void;
  disabled?: boolean;
}

/**
 * Chain info
 */
export interface ChainInfo {
  id: string;
  name: string;
  icon?: string;
  isTestnet?: boolean;
}

/**
 * MultiChainBalanceDisplay component props
 */
export interface MultiChainBalanceDisplayProps extends BaseComponentProps, WithLoadingProps {
  balances: ChainBalance[];
  showEmpty?: boolean;
}

/**
 * Chain balance
 */
export interface ChainBalance {
  chainId: string;
  chainName: string;
  balance: WalletBalance;
}

/**
 * Modal base props
 */
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

/**
 * SessionRequestModal component props
 */
export interface SessionRequestModalProps extends ModalProps {
  request: SessionRequest | null;
  onApprove: () => void;
  onReject: () => void;
}

/**
 * Session request
 */
export interface SessionRequest {
  id: string;
  type: string;
  origin: string;
  description?: string;
  requestedAt: Date;
}

/**
 * CustomWalletModal component props
 */
export interface CustomWalletModalProps extends ModalProps {
  onProviderSelect: (provider: WalletProviderType) => void;
  currentProvider?: WalletProviderType | null;
}

/**
 * OnboardingGuide component props
 */
export interface OnboardingGuideProps extends BaseComponentProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

/**
 * WalletRecommendations component props
 */
export interface WalletRecommendationsProps extends BaseComponentProps {
  userPreferences?: UserWalletPreferences;
  onRecommendationSelect: (provider: WalletProviderType) => void;
}

/**
 * User wallet preferences
 */
export interface UserWalletPreferences {
  securityLevel: 'basic' | 'advanced';
  needsHardwareSupport: boolean;
  preferredFeatures: string[];
}

/**
 * SponsoredBadge component props
 */
export interface SponsoredBadgeProps extends BaseComponentProps {
  isSponsored: boolean;
  sponsorName?: string;
  tooltipText?: string;
}

/**
 * SponsorshipQuota component props
 */
export interface SponsorshipQuotaProps extends BaseComponentProps, WithLoadingProps {
  used: number;
  total: number;
  resetDate?: Date;
}

/**
 * SponsorshipMonitoring component props
 */
export interface SponsorshipMonitoringProps extends BaseComponentProps, WithLoadingProps {
  stats: SponsorshipStats;
  onRefresh?: () => void;
}

/**
 * Sponsorship stats
 */
export interface SponsorshipStats {
  totalSponsored: number;
  activeSponsors: number;
  totalFeesSaved: string;
  topSponsors: SponsorInfo[];
}

/**
 * Sponsor info
 */
export interface SponsorInfo {
  address: string;
  name?: string;
  sponsoredCount: number;
  totalAmount: string;
}

/**
 * ThemePreview component props
 */
export interface ThemePreviewProps extends BaseComponentProps {
  theme: ThemeConfig;
  onApply?: () => void;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  name: string;
  colors: ThemeColors;
  fonts?: ThemeFonts;
}

/**
 * Theme colors
 */
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  error: string;
  success: string;
  warning: string;
}

/**
 * Theme fonts
 */
export interface ThemeFonts {
  primary: string;
  secondary?: string;
  monospace?: string;
}

/**
 * Button component props
 */
export interface ButtonProps extends BaseComponentProps, WithLoadingProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children: ReactNode;
}

/**
 * Input component props
 */
export interface InputProps extends BaseComponentProps, WithErrorProps {
  type?: 'text' | 'password' | 'email' | 'number' | 'tel';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
}

/**
 * Select component props
 */
export interface SelectProps<T = string> extends BaseComponentProps, WithErrorProps {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Select option
 */
export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
}

/**
 * Tooltip component props
 */
export interface TooltipProps extends WithChildrenProps {
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
}

/**
 * Card component props
 */
export interface CardProps extends WithChildrenProps {
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
  footer?: ReactNode;
  elevation?: 'none' | 'low' | 'medium' | 'high';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

/**
 * Alert component props
 */
export interface AlertProps extends BaseComponentProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: AlertAction;
}

/**
 * Alert action
 */
export interface AlertAction {
  label: string;
  onClick: () => void;
}
