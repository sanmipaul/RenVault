/**
 * Analytics Service
 * Handles all analytics tracking for RenVault
 * Integrates with WalletConnect Cloud and custom tracking
 */

export enum AnalyticsEventType {
  // Wallet Connection Events
  WALLET_CONNECTION_INITIATED = 'wallet_connection_initiated',
  WALLET_SELECTION = 'wallet_selection',
  WALLET_CONNECTION_SUCCESS = 'wallet_connection_success',
  WALLET_CONNECTION_FAILED = 'wallet_connection_failed',
  WALLET_DISCONNECTION = 'wallet_disconnection',
  
  // Transaction Events
  DEPOSIT_INITIATED = 'deposit_initiated',
  DEPOSIT_SIGNED = 'deposit_signed',
  DEPOSIT_COMPLETED = 'deposit_completed',
  WITHDRAWAL_INITIATED = 'withdrawal_initiated',
  WITHDRAWAL_SIGNED = 'withdrawal_signed',
  WITHDRAWAL_COMPLETED = 'withdrawal_completed',
  
  // User Engagement Events
  SESSION_STARTED = 'session_started',
  SESSION_ENDED = 'session_ended',
  PAGE_VIEW = 'page_view',
  FEATURE_ADOPTION = 'feature_adoption',
  
  // Network Events
  NETWORK_SWITCHED = 'network_switched',
  
  // Error Events
  CONNECTION_ERROR = 'connection_error',
  TRANSACTION_ERROR = 'transaction_error',
  // On-Ramp Events
  ONRAMP_PURCHASE_INITIATED = 'onramp_purchase_initiated',
  ONRAMP_PURCHASE_SUCCESS = 'onramp_purchase_success',
  ONRAMP_PURCHASE_FAILED = 'onramp_purchase_failed',
}

export interface AnalyticsEventPayload {
  [key: string]: string | number | boolean | undefined;
}

export interface ConnectionMetrics {
  walletType?: string;
  connectionTime?: number;
  success: boolean;
  errorMessage?: string;
  retryCount?: number;
}

export interface TransactionMetrics {
  type: string;
  amount?: number;
  network?: string;
  success: boolean;
  duration?: number;
  gasEstimate?: number;
}

export interface UserSessionMetrics {
  sessionId: string;
  startTime: number;
  endTime?: number;
  actionCount: number;
  walletAddress?: string;
}

class AnalyticsService {
  private sessionId: string = '';
  private sessionStartTime: number = 0;
  private actionCount: number = 0;
  private isOptedOut: boolean = false;
  private events: AnalyticsEventPayload[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.loadOptOutPreference();
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load opt-out preference from localStorage
   */
  private loadOptOutPreference(): void {
    try {
      const storedPreference = localStorage.getItem('analytics_opt_out');
      this.isOptedOut = storedPreference === 'true';
    } catch (error) {
      console.warn('Failed to load analytics opt-out preference:', error);
    }
  }

  /**
   * Check if user has opted out of analytics
   */
  isUserOptedOut(): boolean {
    return this.isOptedOut;
  }

  /**
   * Set user's opt-out preference
   */
  setOptOut(optOut: boolean): void {
    this.isOptedOut = optOut;
    try {
      localStorage.setItem('analytics_opt_out', optOut.toString());
    } catch (error) {
      console.warn('Failed to save analytics opt-out preference:', error);
    }
  }

  /**
   * Track an analytics event
   */
  trackEvent(eventType: AnalyticsEventType, payload?: AnalyticsEventPayload): void {
    if (this.isOptedOut) {
      return;
    }

    const event: AnalyticsEventPayload = {
      event_type: eventType,
      session_id: this.sessionId,
      timestamp: Date.now(),
      ...payload,
    };

    this.events.push(event);
    this.actionCount++;

    console.log('Analytics Event:', event);
  }

  /**
   * Track wallet connection event
   */
  trackWalletConnection(metrics: ConnectionMetrics): void {
    if (this.isOptedOut) return;

    this.trackEvent(
      metrics.success
        ? AnalyticsEventType.WALLET_CONNECTION_SUCCESS
        : AnalyticsEventType.WALLET_CONNECTION_FAILED,
      {
        wallet_type: metrics.walletType,
        connection_time: metrics.connectionTime,
        retry_count: metrics.retryCount || 0,
        error_message: metrics.errorMessage,
      }
    );
  }

  /**
   * Track wallet selection
   */
  trackWalletSelection(walletType: string): void {
    if (this.isOptedOut) return;

    this.trackEvent(AnalyticsEventType.WALLET_SELECTION, {
      wallet_type: walletType,
    });
  }

  /**
   * Track transaction event
   */
  trackTransaction(metrics: TransactionMetrics): void {
    if (this.isOptedOut) return;

    const eventType = metrics.success
      ? metrics.type === 'deposit'
        ? AnalyticsEventType.DEPOSIT_COMPLETED
        : AnalyticsEventType.WITHDRAWAL_COMPLETED
      : AnalyticsEventType.TRANSACTION_ERROR;

    this.trackEvent(eventType, {
      transaction_type: metrics.type,
      amount: metrics.amount,
      network: metrics.network,
      duration: metrics.duration,
      gas_estimate: metrics.gasEstimate,
    });
  }

  /**
   * Track on-ramp purchase lifecycle
   */
  trackOnRampEvent(event: 'initiated' | 'success' | 'failed', payload?: AnalyticsEventPayload): void {
    if (this.isOptedOut) return;
    let type = AnalyticsEventType.ONRAMP_PURCHASE_INITIATED;
    if (event === 'success') type = AnalyticsEventType.ONRAMP_PURCHASE_SUCCESS;
    if (event === 'failed') type = AnalyticsEventType.ONRAMP_PURCHASE_FAILED;

    this.trackEvent(type, {
      ...payload,
    });
  }

  /**
   * Track session start
   */
  trackSessionStart(walletAddress?: string): void {
    if (this.isOptedOut) return;

    this.trackEvent(AnalyticsEventType.SESSION_STARTED, {
      wallet_address: this.anonymizeAddress(walletAddress),
    });
  }

  /**
   * Track session end and return session metrics
   */
  trackSessionEnd(): UserSessionMetrics {
    const sessionMetrics: UserSessionMetrics = {
      sessionId: this.sessionId,
      startTime: this.sessionStartTime,
      endTime: Date.now(),
      actionCount: this.actionCount,
    };

    if (!this.isOptedOut) {
      this.trackEvent(AnalyticsEventType.SESSION_ENDED, {
        session_duration: sessionMetrics.endTime - this.sessionStartTime,
        action_count: this.actionCount,
      });
    }

    return sessionMetrics;
  }

  /**
   * Track network switch
   */
  trackNetworkSwitch(networkName: string): void {
    if (this.isOptedOut) return;

    this.trackEvent(AnalyticsEventType.NETWORK_SWITCHED, {
      network_name: networkName,
    });
  }

  /**
   * Track page view
   */
  trackPageView(pageName: string, metadata?: AnalyticsEventPayload): void {
    if (this.isOptedOut) return;

    this.trackEvent(AnalyticsEventType.PAGE_VIEW, {
      page_name: pageName,
      ...metadata,
    });
  }

  /**
   * Track feature adoption
   */
  trackFeatureAdoption(featureName: string, metadata?: AnalyticsEventPayload): void {
    if (this.isOptedOut) return;

    this.trackEvent(AnalyticsEventType.FEATURE_ADOPTION, {
      feature_name: featureName,
      ...metadata,
    });
  }

  /**
   * Track error event
   */
  trackError(errorType: string, errorMessage: string, metadata?: AnalyticsEventPayload): void {
    if (this.isOptedOut) return;

    this.trackEvent(AnalyticsEventType.CONNECTION_ERROR, {
      error_type: errorType,
      error_message: errorMessage,
      ...metadata,
    });
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get collected events
   */
  getCollectedEvents(): AnalyticsEventPayload[] {
    return [...this.events];
  }

  /**
   * Clear collected events
   */
  clearEvents(): void {
    this.events = [];
  }

  /**
   * Anonymize wallet address for privacy
   */
  private anonymizeAddress(address?: string): string | undefined {
    if (!address) return undefined;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  /**
   * Get action count
   */
  getActionCount(): number {
    return this.actionCount;
  }

  /**
   * Reset action count
   */
  resetActionCount(): void {
    this.actionCount = 0;
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

export default AnalyticsService;
