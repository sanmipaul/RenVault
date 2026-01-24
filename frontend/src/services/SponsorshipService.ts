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
      // In a real app, this would be an API call
      const saved = localStorage.getItem(`sponsorship_quota_${this.userId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          resetDate: new Date(parsed.resetDate)
        };
      }

      // Default quota for new users
      const defaultQuota: SponsorshipQuota = {
        total: 5,
        used: 0,
        remaining: 5,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      };
      this.saveQuota(defaultQuota);
      return defaultQuota;
    } catch (error) {
      logger.error('Failed to fetch sponsorship quota', error);
      throw error;
    }
  }

  private saveQuota(quota: SponsorshipQuota) {
    if (this.userId) {
      localStorage.setItem(`sponsorship_quota_${this.userId}`, JSON.stringify(quota));
    }
  }

  async isEligible(operation: string, value?: number): Promise<boolean> {
    try {
      const quota = await this.getQuota();
      if (quota.remaining <= 0) return false;

      // Simple policy check
      const eligibleOperations = ['deposit', 'vault_creation', 'withdrawal_small'];
      if (!eligibleOperations.includes(operation)) return false;

      if (value && value > 100000000) { // Max 100 STX for sponsorship
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
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

  async getPaymasterData(txData: any): Promise<any> {
    // This would typically interact with a paymaster service to get sponsorship signature
    return {
      paymasterAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Example paymaster
      signature: '0x...', // Mock signature
      validUntil: Math.floor(Date.now() / 1000) + 3600
    };
  }
}

export default SponsorshipService;
