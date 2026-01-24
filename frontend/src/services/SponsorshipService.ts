import { logger } from '../utils/logger';

export interface SponsorshipQuota {
  total: number;
  used: number;
  remaining: number;
  resetDate: Date;
}

export interface SponsorshipPolicy {
  id: string;
  name: string;
  description: string;
  type: 'onboarding' | 'promotion' | 'operation' | 'premium';
  maxTransactions: number;
  eligibleOperations: string[];
  maxTransactionValue?: number; // In micro-STX
}

class SponsorshipService {
  private static instance: SponsorshipService;
  private userId: string | null = null;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = 'http://localhost:3003/api/sponsorship';
  }

  static getInstance(): SponsorshipService {
    if (!SponsorshipService.instance) {
      SponsorshipService.instance = new SponsorshipService();
    }
    return SponsorshipService.instance;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  async getQuota(): Promise<SponsorshipQuota> {
    if (!this.userId) throw new Error('User ID not set');
    
    try {
      const saved = localStorage.getItem(`sponsorship_quota_${this.userId}`);
      let quota: SponsorshipQuota;

      if (saved) {
        quota = JSON.parse(saved);
        quota.resetDate = new Date(quota.resetDate);
        
        // Check for reset
        if (new Date() > quota.resetDate) {
          quota = this.getDefaultQuota();
        }
      } else {
        quota = this.getDefaultQuota();
      }

      this.saveQuota(quota);
      return quota;
    } catch (error) {
      logger.error('Failed to fetch sponsorship quota', error);
      throw error;
    }
  }

  private getDefaultQuota(): SponsorshipQuota {
    return {
      total: 5,
      used: 0,
      remaining: 5,
      resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };
  }

  async getPolicies(): Promise<SponsorshipPolicy[]> {
    return [
      {
        id: 'onboarding-free',
        name: 'New User Onboarding',
        description: 'First 5 transactions are free for all new users.',
        type: 'onboarding',
        maxTransactions: 5,
        eligibleOperations: ['deposit', 'vault_creation']
      },
      {
        id: 'small-withdrawals',
        name: 'Small Withdrawal Sponsorship',
        description: 'Withdrawals under 10 STX are sponsored to reduce friction.',
        type: 'operation',
        maxTransactions: 10,
        eligibleOperations: ['withdrawal'],
        maxTransactionValue: 10000000 // 10 STX
      }
    ];
  }

  private saveQuota(quota: SponsorshipQuota) {
    if (this.userId) {
      localStorage.setItem(`sponsorship_quota_${this.userId}`, JSON.stringify(quota));
    }
  }

  async isEligible(operation: string, value?: number): Promise<boolean> {
    try {
      // Check rate limiting first
      if (this.isRateLimited()) {
        logger.warn('Sponsorship request rate limited');
        return false;
      }

      const quota = await this.getQuota();
      if (quota.remaining <= 0) return false;

      // Simple policy check
      const eligibleOperations = ['deposit', 'vault_creation', 'withdrawal_small'];
      if (!eligibleOperations.includes(operation)) return false;

      if (value && value > 100000000) { // Max 100 STX for sponsorship
        return false;
      }

      this.recordRequest();
      return true;
    } catch (error) {
      return false;
    }
  }

  private lastRequestTime: number = 0;
  private requestsInWindow: number = 0;
  private readonly WINDOW_SIZE = 60000; // 1 minute
  private readonly MAX_REQUESTS = 3;

  private isRateLimited(): boolean {
    const now = Date.now();
    if (now - this.lastRequestTime > this.WINDOW_SIZE) {
      this.requestsInWindow = 0;
      return false;
    }
    return this.requestsInWindow >= this.MAX_REQUESTS;
  }

  private recordRequest() {
    const now = Date.now();
    if (now - this.lastRequestTime > this.WINDOW_SIZE) {
      this.requestsInWindow = 1;
    } else {
      this.requestsInWindow++;
    }
    this.lastRequestTime = now;
  }

  async trackSponsorship(txHash: string, operation: string) {
    if (!this.userId) return;

    try {
      const quota = await this.getQuota();
      const updatedQuota: SponsorshipQuota = {
        ...quota,
        used: quota.used + 1,
        remaining: Math.max(0, quota.remaining - 1)
      };
      this.saveQuota(updatedQuota);

      logger.info(`Sponsorship tracked for ${operation}: ${txHash}`);
      
      // Track analytics
      this.logSponsorshipAnalytics(operation, txHash);
      
      // In a real app, notify the backend
      await fetch(`${this.baseUrl}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.userId,
          txHash,
          operation,
          timestamp: new Date()
        })
      }).catch(err => logger.warn('Failed to sync sponsorship with backend', err));
      
    } catch (error) {
      logger.error('Error tracking sponsorship', error);
    }
  }

  private logSponsorshipAnalytics(operation: string, txHash: string) {
    // In a real app, this would use a real analytics service
    const event = {
      category: 'Sponsorship',
      action: 'Transaction Sponsored',
      label: operation,
      value: 1,
      metadata: { txHash, userId: this.userId }
    };
    console.log('📊 Sponsorship Analytics:', event);
  }

  async getPaymasterData(txData: any): Promise<any> {
    // Check eligibility again before requesting paymaster data
    const eligible = await this.isEligible(txData.operation, txData.amount);
    if (!eligible) {
      throw new Error('Transaction not eligible for sponsorship or quota exceeded');
    }

    // In a real app, this would interact with a paymaster service
    return {
      paymasterAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      signature: '0x...',
      validUntil: Math.floor(Date.now() / 1000) + 3600
    };
  }

  handleSponsorshipError(error: any): string {
    logger.warn('Sponsorship failed, falling back to user-paid gas', error);
    if (error.message.includes('quota exceeded')) {
      return 'Sponsorship quota exceeded. You will need to pay gas for this transaction.';
    }
    return 'Gas sponsorship is currently unavailable. Please ensure you have STX for gas fees.';
  }
}

export default SponsorshipService;
