/**
 * WalletConnect Cloud Analytics Wrapper
 * Integrates with WalletConnect Cloud for analytics
 */

export interface WalletConnectAnalyticsConfig {
  projectId: string;
  enableAnalytics: boolean;
  enableEventTracking: boolean;
  enableFunnelTracking: boolean;
  enableErrorTracking: boolean;
}

class WalletConnectAnalyticsWrapper {
  private config: WalletConnectAnalyticsConfig;
  private eventBuffer: any[] = [];
  private batchSize = 50;
  private flushInterval = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: WalletConnectAnalyticsConfig) {
    this.config = config;
    this.startBatching();
  }

  /**
   * Start event batching
   */
  private startBatching(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Track event to WalletConnect Cloud
   */
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (!this.config.enableAnalytics || !this.config.enableEventTracking) {
      return;
    }

    const event = {
      name: eventName,
      properties: {
        ...properties,
        timestamp: Date.now(),
      },
    };

    this.eventBuffer.push(event);

    if (this.eventBuffer.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Flush events to WalletConnect Cloud
   */
  private async flush(): Promise<void> {
    if (this.eventBuffer.length === 0) {
      return;
    }

    const eventsToSend = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      // This would send to WalletConnect Cloud API
      console.log('Flushing analytics events to WalletConnect Cloud:', eventsToSend.length);
      
      // In production, this would make an actual API call
      // await fetch('https://api.walletconnect.cloud/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     projectId: this.config.projectId,
      //     events: eventsToSend
      //   })
      // });
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Re-add events to buffer on failure
      this.eventBuffer.unshift(...eventsToSend);
    }
  }

  /**
   * Get event buffer
   */
  getEventBuffer(): any[] {
    return [...this.eventBuffer];
  }

  /**
   * Clear event buffer
   */
  clearBuffer(): void {
    this.eventBuffer = [];
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }
}

export default WalletConnectAnalyticsWrapper;
