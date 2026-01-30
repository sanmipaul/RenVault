/**
 * Type definitions for notification service
 */

export type NotificationType =
  | 'transaction'
  | 'security'
  | 'reward'
  | 'system'
  | 'wallet_session'
  | 'wallet_request'
  | 'wallet_error';

export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority?: NotificationPriority;
  actions?: string[];
  data?: NotificationData;
}

/**
 * Notification data payload types for different notification types
 */
export interface NotificationData {
  // Wallet session data
  metadata?: WalletSessionMetadata;
  proposalId?: string;
  topic?: string;
  namespaces?: Record<string, unknown>;

  // Wallet request data
  requestId?: number;
  method?: string;

  // Transaction data
  txId?: string;
  amount?: number;
  asset?: string;

  // Generic data
  [key: string]: unknown;
}

export interface WalletSessionMetadata {
  name?: string;
  description?: string;
  url?: string;
  icons?: string[];
}

/**
 * User notification preferences
 */
export interface NotificationPreferences {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  doNotDisturb: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  transactionAlerts: boolean;
  securityAlerts: boolean;
  rewardAlerts: boolean;
  systemNotifications: boolean;
}

/**
 * Default notification preferences
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  soundEnabled: true,
  vibrationEnabled: true,
  doNotDisturb: false,
  emailNotifications: true,
  pushNotifications: true,
  transactionAlerts: true,
  securityAlerts: true,
  rewardAlerts: true,
  systemNotifications: true
};

/**
 * Push subscription data for server
 */
export interface PushSubscriptionData {
  userId: string;
  endpoint: string;
  keys: {
    p256dh?: string;
    auth?: string;
  };
}

/**
 * Notification service response types
 */
export interface NotificationResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Test notification payload types
 */
export interface DepositNotificationPayload {
  userId: string;
  amount: number;
  balance: number;
}

export interface WithdrawalNotificationPayload {
  userId: string;
  amount: number;
  balance: number;
}

export interface StakingRewardPayload {
  userId: string;
  amount: number;
  stakedAmount: number;
}

export interface LiquidityRewardPayload {
  userId: string;
  amount: number;
  poolName: string;
}

export interface SecurityAlertPayload {
  userId: string;
  ipAddress: string;
  userAgent?: string;
  activity?: string;
}
