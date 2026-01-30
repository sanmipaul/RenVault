/**
 * RenVault Types Index
 *
 * Central export point for all TypeScript type definitions.
 * Import from '@/types' or '../types' to access any type.
 */

// ============================================================================
// Notification Types
// ============================================================================
export {
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  NotificationActionType,
  PushSubscriptionState
} from './notification';
export type {
  Notification,
  NotificationAction,
  NotificationData,
  NotificationFilter,
  NotificationGroup,
  NotificationPreferences,
  ChannelPreferences,
  NotificationTemplate,
  PushNotificationConfig,
  NotificationEventMap
} from './notification';

// ============================================================================
// Wallet Connection Types
// ============================================================================
export {
  WalletErrorCode
} from './walletConnection';
export type {
  WalletConnectionState,
  WalletNetwork,
  WalletProviderType,
  WalletConnectionResult,
  WalletConnectionError,
  TransactionOptions,
  SignedTransactionResult,
  WalletSession,
  MultiSigConfig,
  CoSigner,
  PendingMultiSigTransaction,
  TransactionSignature,
  MultiSigTxStatus,
  WalletBalance,
  FungibleTokenBalance,
  NFTBalance
} from './walletConnection';

// ============================================================================
// Transaction Types
// ============================================================================
export {
  TransactionStatus,
  TransactionType,
  PostConditionType,
  PostConditionMode
} from './transaction';
export type {
  TransactionDetails,
  TransactionRequest,
  TransactionResult,
  TransactionReceipt,
  TransactionEvent,
  ContractCallEvent,
  TransferEvent,
  PostCondition,
  STXPostCondition,
  FungiblePostCondition,
  NFTPostCondition,
  TransactionFee,
  TransactionFilter,
  TransactionSort,
  TransactionListOptions,
  BroadcastOptions,
  SigningOptions
} from './transaction';

// ============================================================================
// API Types
// ============================================================================
export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  PaginationMeta,
  RequestOptions,
  BalanceResponse,
  TokenBalance,
  AccountInfoResponse,
  TransactionResponse,
  TransactionListResponse,
  BlockResponse,
  ContractResponse,
  ContractFunction,
  ContractFunctionArg,
  VaultStatsResponse,
  AssetStats,
  DepositRequest,
  DepositResponse,
  WithdrawRequest,
  WithdrawResponse,
  PriceResponse,
  PriceData,
  HealthCheckResponse,
  ServiceHealth,
  WebSocketMessage,
  WebSocketSubscription
} from './api';

// ============================================================================
// Form Types
// ============================================================================
export type {
  DepositFormData,
  WithdrawalFormData,
  TransferFormData,
  WalletSetupFormData,
  MultiSigSetupFormData,
  TwoFactorSetupFormData,
  LoginFormData,
  ProfileFormData,
  NotificationSettingsFormData,
  FormState,
  FieldError,
  FormValidationRules,
  FieldValidator,
  FormSubmitHandler,
  FormChangeHandler,
  FormBlurHandler,
  FormResetHandler,
  FormConfig
} from './forms';

// ============================================================================
// Context Types
// ============================================================================
export type {
  WalletContextType,
  WalletState,
  WalletActions,
  ThemeContextType,
  ThemeState,
  ThemeActions,
  TransactionContextType,
  TransactionState,
  TransactionActions,
  NotificationContextType,
  NotificationState,
  NotificationActions,
  UserContextType,
  UserState,
  UserActions,
  User,
  UserPreferences,
  SessionContextType,
  SessionState,
  SessionActions,
  AppContextType,
  AppState,
  AppActions,
  NetworkInfo
} from './context';

// ============================================================================
// Hook Types
// ============================================================================
export type {
  UseWalletReturn,
  UseBalanceReturn,
  UseTransactionReturn,
  UseTransactionHistoryReturn,
  UseAsyncReturn,
  UseLocalStorageReturn,
  UseDebounceReturn,
  UseThrottleReturn,
  UseMediaQueryReturn,
  UseOnClickOutsideOptions,
  UseIntervalOptions,
  UseClipboardReturn,
  UseFormReturn,
  UseModalReturn,
  UseToggleReturn,
  UsePreviousReturn,
  UseNetworkReturn,
  UseCountdownReturn,
  UsePaginationReturn,
  UseSearchReturn
} from './hooks';

// ============================================================================
// Utility Types
// ============================================================================
export type {
  Result,
  AsyncResult,
  Nullable,
  Optional,
  PartialBy,
  RequiredBy,
  DeepPartial,
  DeepReadonly,
  KeysOfType,
  ValidationResult,
  ValidationError,
  ValidatorFn,
  AsyncValidatorFn,
  DebounceOptions,
  ThrottleOptions,
  RetryOptions,
  CacheOptions,
  CacheEntry,
  EventHandler,
  AsyncEventHandler,
  VoidCallback,
  AsyncVoidCallback,
  Callback,
  AsyncCallback,
  Comparator,
  Predicate,
  AsyncPredicate,
  Mapper,
  AsyncMapper,
  Reducer,
  NumberFormatOptions,
  DateFormatOptions,
  AddressFormatOptions,
  PaginationParams,
  FilterParams,
  SearchParams,
  TimeRange,
  Point,
  Size,
  Rect,
  Color,
  HSLColor,
  EnvConfig,
  FeatureFlags,
  LogLevel,
  LogEntry
} from './utils';

// ============================================================================
// Component Types
// ============================================================================
export type {
  BaseComponentProps,
  WithChildrenProps,
  WithLoadingProps,
  WithErrorProps,
  AddressDisplayProps,
  BalanceDisplayProps,
  WalletConnectProps,
  WalletConnectionProps,
  ProviderSelectorProps,
  DepositFormProps,
  TransactionHistoryProps,
  TransactionSignerProps,
  TransactionSuccessProps,
  TransactionStatusDisplayProps,
  MultiSigSetupProps,
  CoSignerManagementProps,
  MultiSigTransactionSignerProps,
  NotificationCenterProps,
  NotificationPreferencesProps,
  SessionStatusProps,
  SessionDashboardProps,
  SessionInfo,
  ConnectionStatusProps,
  AutoReconnectProps,
  HardwareWalletConnectorProps,
  WalletBackupProps,
  WalletRecoveryProps,
  BackupCodesProps,
  TwoFactorAuthSetupProps,
  TwoFactorAuthVerifyProps,
  AnalyticsProps,
  AnalyticsData,
  ChartDataPoint,
  PerformanceMonitorProps,
  PerformanceMetrics,
  ChainSelectorProps,
  ChainInfo,
  MultiChainBalanceDisplayProps,
  ChainBalance,
  ModalProps,
  SessionRequestModalProps,
  SessionRequest,
  CustomWalletModalProps,
  OnboardingGuideProps,
  WalletRecommendationsProps,
  UserWalletPreferences,
  SponsoredBadgeProps,
  SponsorshipQuotaProps,
  SponsorshipMonitoringProps,
  SponsorshipStats,
  SponsorInfo,
  ThemePreviewProps,
  ThemeConfig,
  ThemeColors,
  ThemeFonts,
  ButtonProps,
  InputProps,
  SelectProps,
  SelectOption,
  TooltipProps,
  CardProps,
  AlertProps,
  AlertAction
} from './components';

// ============================================================================
// Crypto Types
// ============================================================================
export {
  CryptoError,
  CryptoErrorCode
} from './crypto';
export type {
  BackupEncryptionConfig,
  SecureBackupData,
  BackupMetadata,
  WalletBackupData,
  KeyDerivationParams,
  EncryptionResult,
  DecryptionResult,
  HashVerificationResult,
  SecureRandomOptions
} from './crypto';
