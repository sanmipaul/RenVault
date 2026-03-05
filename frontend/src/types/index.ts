/**
 * RenVault Types Index
 *
 * Central export point for all TypeScript type definitions.
 * Import from '@/types' or '../types' to access any type.
 */

// ============================================================================
// Notification Types
// ============================================================================
export type {
  NotificationType,
  NotificationPriority,
  Notification,
  NotificationData,
  NotificationPreferences,
  PushSubscriptionData,
  NotificationResponse
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
export type {
  TransactionStatus,
  TransactionType,
  PostConditionType,
  TransactionDetails,
  TransactionRequest,
  TransactionReceipt,
  TransactionEvent,
  PostCondition
} from './transaction';

// ============================================================================
// API Types
// ============================================================================
export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  BalanceResponse,
  TransactionResponse,
  ContractFunction,
  VaultStatsResponse,
  PriceResponse,
  HealthCheckResponse,
  ServiceHealth,
  ContractInfoResponse
} from './api';

// ============================================================================
// Form Types
// ============================================================================
export type {
  DepositFormData,
  WithdrawalFormData,
  TransferFormData,
  NotificationSettingsForm,
  FormState,
  FormSubmitHandler,
  FormResetHandler,
  FormValidationResult,
  FieldValidator
} from './forms';

// ============================================================================
// Context Types
// ============================================================================
export type {
  WalletContextType,
  WalletContextState,
  WalletContextActions,
  ThemeContextType,
  ThemeContextState,
  ThemeContextActions,
  TransactionContextType,
  TransactionContextState,
  TransactionContextActions,
  UserContextType,
  UserContextState,
  UserContextActions,
  UserPreferences,
  AppContextType,
  AppContextState,
  AppContextActions
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

// ============================================================================
// Service Types
// ============================================================================
export type {
  // Wallet Service
  IWalletService,
  WalletConnectionInfo,
  UnsignedTransaction,
  SignedTransaction,
  // Transaction Service
  ITransactionService,
  TransactionSubmitResult,
  TransactionHistoryOptions,
  TransactionHistoryResult,
  FeeEstimate,
  // Storage Service
  IStorageService,
  StorageSetOptions,
  EncryptedStorageItem,
  // Session Service
  ISessionService,
  SessionCreateOptions,
  Session,
  DeviceInfo,
  // Notification Service
  INotificationService,
  NotificationCreateOptions,
  NotificationActionConfig,
  NotificationItem,
  NotificationCallback,
  UnsubscribeFn,
  // API Service
  IApiService,
  ApiRequestOptions,
  ApiInterceptor,
  ApiRequestConfig,
  ApiServiceError,
  // WebSocket Service
  IWebSocketService,
  WebSocketOutgoingMessage,
  WebSocketIncomingMessage,
  WebSocketMessageCallback,
  ConnectionChangeCallback,
  // Analytics Service
  IAnalyticsService,
  AnalyticsEvent,
  UserTraits,
  PageProperties,
  // Logger Service
  ILoggerService,
  LogLevelType,
  LogContext,
  LogTransport,
  // Backup Service
  IBackupService,
  BackupCreateOptions,
  BackupResult,
  RestoreResult,
  BackupVerifyResult,
  BackupInfo,
  // Contract Service
  IContractService,
  ContractCallOptions,
  ContractReadOptions,
  ContractDeployOptions,
  ContractDeployResult,
  ContractArg,
  ContractArgType
} from './services';
