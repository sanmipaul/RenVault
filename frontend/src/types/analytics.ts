/**
 * Analytics Type Definitions
 * Type definitions for analytics data structures
 */

export interface AnalyticsConfig {
  enableAnalytics: boolean;
  enableWalletConnectCloud: boolean;
  privacyMode: boolean;
  dataRetentionDays: number;
  cookieConsentRequired: boolean;
  anonymizeUserData: boolean;
}

export interface WalletMetrics {
  walletType: string;
  connectionCount: number;
  successRate: number;
  averageConnectionTime: number;
  abandonmentRate: number;
  lastConnectedAt: number;
}

export interface TransactionAnalytics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalVolumeUSD: number;
  averageTransactionAmount: number;
  averageSigningTime: number;
  successRate: number;
}

export interface UserEngagementMetrics {
  sessionCount: number;
  totalSessionDuration: number;
  averageSessionDuration: number;
  actionsPerSession: number;
  returnUserRate: number;
  lastActiveAt: number;
  features: FeatureAdoption[];
}

export interface FeatureAdoption {
  featureName: string;
  adoptionCount: number;
  adoptionRate: number;
  lastUsedAt: number;
}

export interface FunnelStep {
  stepName: string;
  stepIndex: number;
  completionCount: number;
  dropOffCount: number;
  completionRate: number;
  avgTimeToComplete: number;
}

export interface ConnectionFunnel {
  initiation: FunnelStep;
  walletSelection: FunnelStep;
  walletAuthorization: FunnelStep;
  confirmation: FunnelStep;
  completion: FunnelStep;
  totalDropOff: number;
}

export interface PerformanceMetrics {
  connectionLatency: number[];
  transactionConfirmationTime: number[];
  modalLoadTime: number[];
  errorRate: number;
  errorsByType: Record<string, number>;
}

export interface ErrorAnalytics {
  errorType: string;
  errorMessage: string;
  occurenceCount: number;
  lastOccurredAt: number;
  affectedUsers: number;
  resolutionStatus: 'open' | 'investigating' | 'resolved';
}

export interface NetworkMetrics {
  networkName: string;
  switchCount: number;
  transactionCount: number;
  totalVolume: number;
  averageGasPrice: number;
  networkPreference: number;
}

export interface DashboardData {
  dateRange: {
    startDate: number;
    endDate: number;
  };
  summary: {
    dailyActiveUsers: number;
    totalTransactions: number;
    totalVolume: number;
    connectionSuccessRate: number;
  };
  walletMetrics: WalletMetrics[];
  transactionAnalytics: TransactionAnalytics;
  userEngagement: UserEngagementMetrics;
  connectionFunnel: ConnectionFunnel;
  performanceMetrics: PerformanceMetrics;
  topErrors: ErrorAnalytics[];
  networkMetrics: NetworkMetrics[];
  retention: RetentionMetrics;
}

export interface RetentionMetrics {
  day1Retention: number;
  day7Retention: number;
  day30Retention: number;
  monthlyRetention: number;
  churnRate: number;
}

export interface CookieConsent {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  consentDate: number;
  version: string;
}

export interface PrivacySettings {
  anonymizeWalletAddress: boolean;
  skipPII: boolean;
  gdprCompliant: boolean;
  optOutTrackingId: string;
}

export interface AnalyticsEvent {
  eventId: string;
  eventType: string;
  sessionId: string;
  userId?: string;
  timestamp: number;
  data: Record<string, any>;
  source: 'web' | 'mobile' | 'api';
  ipAddress?: string;
}

export interface AnalyticsAlert {
  alertId: string;
  alertType: 'critical' | 'warning' | 'info';
  message: string;
  threshold: number;
  currentValue: number;
  metric: string;
  createdAt: number;
  resolvedAt?: number;
}

export interface FunnelAnalysis {
  funnelName: string;
  steps: FunnelStep[];
  totalInitiations: number;
  conversionRate: number;
  avgTimeToConversion: number;
  bottlenecks: FunnelStep[];
}

export interface GdprCompliance {
  dataCollectionNotice: boolean;
  privacyPolicyLink: string;
  optOutMechanism: boolean;
  dataExportCapability: boolean;
  dataDeleteCapability: boolean;
  retentionPolicy: string;
  consentRequired: boolean;
}

export default {
  AnalyticsConfig,
  WalletMetrics,
  TransactionAnalytics,
  UserEngagementMetrics,
  ConnectionFunnel,
  PerformanceMetrics,
  ErrorAnalytics,
  DashboardData,
  PrivacySettings,
  GdprCompliance,
};
