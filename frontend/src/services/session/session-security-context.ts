/**
 * Session Security Context
 * Provides session security checks and middleware
 */

import { SmartSessionConfig, SessionPermissionRequest, SessionValidationResult } from '../types/smartsessions';
import { sessionPermissionManager } from '../services/session/session-permission-manager';
import { smartSessionAnalytics } from '../services/smart-session-analytics';

export class SessionSecurityContext {
  private static instance: SessionSecurityContext;
  private readonly RATE_LIMIT_WINDOW = 1000; // 1 second
  private readonly MAX_REQUESTS_PER_WINDOW = 10;
  private requestCounts: Map<string, number> = new Map();

  static getInstance(): SessionSecurityContext {
    if (!SessionSecurityContext.instance) {
      SessionSecurityContext.instance = new SessionSecurityContext();
    }
    return SessionSecurityContext.instance;
  }

  /**
   * Validate session before transaction execution
   */
  validateSessionBeforeTransaction(
    session: SmartSessionConfig,
    request: SessionPermissionRequest
  ): SessionValidationResult {
    // Check permission
    const permissionResult = sessionPermissionManager.validatePermission(session, request);
    if (!permissionResult.isValid) {
      smartSessionAnalytics.trackPermissionValidation(session.id, false);
      return permissionResult;
    }

    // Check rate limit
    if (this.isRateLimited(session.id)) {
      smartSessionAnalytics.trackPermissionValidation(session.id, false);
      return {
        isValid: false,
        reason: 'Rate limit exceeded',
        requiresConfirmation: true,
      };
    }

    smartSessionAnalytics.trackPermissionValidation(session.id, true);
    return permissionResult;
  }

  /**
   * Check if session is rate limited
   */
  private isRateLimited(sessionId: string): boolean {
    const count = this.requestCounts.get(sessionId) || 0;
    if (count >= this.MAX_REQUESTS_PER_WINDOW) {
      return true;
    }

    this.requestCounts.set(sessionId, count + 1);

    // Reset counter after window
    setTimeout(() => {
      this.requestCounts.set(sessionId, 0);
    }, this.RATE_LIMIT_WINDOW);

    return false;
  }

  /**
   * Verify transaction matches session constraints
   */
  verifyTransactionConstraints(
    session: SmartSessionConfig,
    transactionData: {
      operation: string;
      amount?: string;
      contractAddress?: string;
    }
  ): boolean {
    // Verify operation is whitelisted
    if (!session.constraints.operationWhitelist.includes(transactionData.operation as any)) {
      return false;
    }

    // Verify contract if whitelisted
    if (transactionData.contractAddress && session.constraints.contractWhitelist) {
      if (!session.constraints.contractWhitelist.includes(transactionData.contractAddress)) {
        return false;
      }
    }

    // Verify amount
    if (transactionData.amount) {
      const requestAmount = BigInt(transactionData.amount);
      const sessionLimit = BigInt(session.spendingLimit.amount);
      if (requestAmount > sessionLimit) {
        return false;
      }
    }

    return true;
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.requestCounts.clear();
  }
}

export const sessionSecurityContext = SessionSecurityContext.getInstance();
