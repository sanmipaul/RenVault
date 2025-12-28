/**
 * Funnel Analytics Tracker
 * Tracks user journey through conversion funnels
 */

import { FunnelStep, FunnelAnalysis } from '../types/analytics';

export interface FunnelConfig {
  funnelName: string;
  steps: string[];
  sessionTrackingEnabled: boolean;
}

export interface UserFunnelSession {
  sessionId: string;
  userId?: string;
  funnelName: string;
  startedAt: number;
  completedAt?: number;
  completedSteps: string[];
  abandonedAt?: {
    step: string;
    timestamp: number;
    reason?: string;
  };
  metadata?: Record<string, any>;
}

class FunnelAnalyticsTracker {
  private activeSessions: Map<string, UserFunnelSession> = new Map();
  private completedSessions: UserFunnelSession[] = [];
  private funnelStats: Map<string, FunnelAnalysis> = new Map();
  private maxSessions = 1000;

  constructor() {
    this.initializeCommonFunnels();
    this.loadStats();
  }

  /**
   * Initialize common funnels
   */
  private initializeCommonFunnels(): void {
    const commonFunnels: FunnelConfig[] = [
      {
        funnelName: 'connection_funnel',
        steps: [
          'connection_initiated',
          'wallet_selected',
          'authorization_requested',
          'authorization_confirmed',
          'connection_completed',
        ],
        sessionTrackingEnabled: true,
      },
      {
        funnelName: 'deposit_funnel',
        steps: [
          'deposit_page_viewed',
          'deposit_form_opened',
          'amount_entered',
          'review_confirmed',
          'transaction_signed',
          'deposit_completed',
        ],
        sessionTrackingEnabled: true,
      },
      {
        funnelName: 'withdrawal_funnel',
        steps: [
          'withdrawal_page_viewed',
          'withdrawal_form_opened',
          'amount_entered',
          'review_confirmed',
          'transaction_signed',
          'withdrawal_completed',
        ],
        sessionTrackingEnabled: true,
      },
    ];

    commonFunnels.forEach((config) => {
      this.registerFunnel(config);
    });
  }

  /**
   * Load stats from storage
   */
  private loadStats(): void {
    try {
      const stored = localStorage.getItem('funnel_analytics_stats');
      if (stored) {
        const stats = JSON.parse(stored);
        Object.entries(stats).forEach(([key, value]) => {
          this.funnelStats.set(key, value as FunnelAnalysis);
        });
      }
    } catch (error) {
      console.warn('Failed to load funnel stats:', error);
    }
  }

  /**
   * Save stats to storage
   */
  private saveStats(): void {
    try {
      const stats: Record<string, FunnelAnalysis> = {};
      this.funnelStats.forEach((value, key) => {
        stats[key] = value;
      });
      localStorage.setItem('funnel_analytics_stats', JSON.stringify(stats));
    } catch (error) {
      console.warn('Failed to save funnel stats:', error);
    }
  }

  /**
   * Register a funnel
   */
  private registerFunnel(config: FunnelConfig): void {
    if (!this.funnelStats.has(config.funnelName)) {
      const analysis: FunnelAnalysis = {
        funnelName: config.funnelName,
        steps: config.steps.map((step, index) => ({
          stepName: step,
          stepIndex: index,
          completionCount: 0,
          dropOffCount: 0,
          completionRate: 0,
          avgTimeToComplete: 0,
        })),
        totalInitiations: 0,
        conversionRate: 0,
        avgTimeToConversion: 0,
        bottlenecks: [],
      };
      this.funnelStats.set(config.funnelName, analysis);
    }
  }

  /**
   * Start a funnel session
   */
  startFunnelSession(funnelName: string, userId?: string, metadata?: Record<string, any>): string {
    const sessionId = this.generateSessionId();

    const session: UserFunnelSession = {
      sessionId,
      userId,
      funnelName,
      startedAt: Date.now(),
      completedSteps: [],
      metadata,
    };

    this.activeSessions.set(sessionId, session);

    // Update funnel stats
    const stats = this.funnelStats.get(funnelName);
    if (stats) {
      stats.totalInitiations++;
      stats.steps[0].completionCount++;
      stats.steps[0].completionRate = stats.steps[0].completionCount / stats.totalInitiations;
    }

    this.saveStats();
    return sessionId;
  }

  /**
   * Track step completion in funnel
   */
  trackFunnelStep(sessionId: string, stepName: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      console.warn(`Funnel session not found: ${sessionId}`);
      return false;
    }

    if (session.completedSteps.includes(stepName)) {
      console.warn(`Step already completed: ${stepName}`);
      return false;
    }

    session.completedSteps.push(stepName);

    // Update funnel stats
    const stats = this.funnelStats.get(session.funnelName);
    if (stats) {
      const stepIndex = stats.steps.findIndex((s) => s.stepName === stepName);
      if (stepIndex >= 0) {
        stats.steps[stepIndex].completionCount++;
        stats.steps[stepIndex].completionRate =
          stats.steps[stepIndex].completionCount / stats.totalInitiations;

        // Calculate time to complete
        if (stepIndex > 0) {
          const timeToComplete = Date.now() - session.startedAt;
          stats.steps[stepIndex].avgTimeToComplete =
            (stats.steps[stepIndex].avgTimeToComplete +
              timeToComplete) /
            2;
        }

        // Update dropout count for previous step
        if (stepIndex > 0) {
          const prevStep = stats.steps[stepIndex - 1];
          if (prevStep.completionCount > 0) {
            prevStep.dropOffCount = prevStep.completionCount - stats.steps[stepIndex].completionCount;
          }
        }
      }
    }

    this.saveStats();
    return true;
  }

  /**
   * Complete a funnel session
   */
  completeFunnelSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      console.warn(`Funnel session not found: ${sessionId}`);
      return false;
    }

    session.completedAt = Date.now();
    const timeToConversion = session.completedAt - session.startedAt;

    // Update funnel stats
    const stats = this.funnelStats.get(session.funnelName);
    if (stats) {
      stats.avgTimeToConversion =
        (stats.avgTimeToConversion + timeToConversion) / 2;
      stats.conversionRate = 0;
    }

    this.completedSessions.push(session);
    if (this.completedSessions.length > this.maxSessions) {
      this.completedSessions.shift();
    }

    this.activeSessions.delete(sessionId);
    this.saveStats();

    return true;
  }

  /**
   * Abandon a funnel session
   */
  abandonFunnelSession(sessionId: string, reason?: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      console.warn(`Funnel session not found: ${sessionId}`);
      return false;
    }

    const lastCompletedStep = session.completedSteps[session.completedSteps.length - 1];

    session.abandonedAt = {
      step: lastCompletedStep || 'initial',
      timestamp: Date.now(),
      reason,
    };

    this.completedSessions.push(session);
    if (this.completedSessions.length > this.maxSessions) {
      this.completedSessions.shift();
    }

    this.activeSessions.delete(sessionId);
    this.saveStats();

    return true;
  }

  /**
   * Get funnel analysis
   */
  getFunnelAnalysis(funnelName: string): FunnelAnalysis | undefined {
    return this.funnelStats.get(funnelName);
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `funnel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get active session count
   */
  getActiveSessionCount(): number {
    return this.activeSessions.size;
  }

  /**
   * Clear all data
   */
  clearAllData(): void {
    this.activeSessions.clear();
    this.completedSessions = [];
    this.funnelStats.clear();
    this.initializeCommonFunnels();
    this.saveStats();
  }
}

export const funnelAnalyticsTracker = new FunnelAnalyticsTracker();

export default FunnelAnalyticsTracker;
