/**
 * Session Permission Manager Service
 * Manages validation and enforcement of session permissions
 */

import {
  SmartSessionConfig,
  SessionPermission,
  SessionPermissionRequest,
  SessionValidationResult,
  SessionStatus,
} from '../types/smartsessions';

export class SessionPermissionManager {
  private static instance: SessionPermissionManager;
  private permissionCache: Map<string, boolean> = new Map();

  static getInstance(): SessionPermissionManager {
    if (!SessionPermissionManager.instance) {
      SessionPermissionManager.instance = new SessionPermissionManager();
    }
    return SessionPermissionManager.instance;
  }

  /**
   * Validate if a session can execute a permission request
   */
  validatePermission(
    session: SmartSessionConfig,
    request: SessionPermissionRequest
  ): SessionValidationResult {
    // Check session expiration
    if (Date.now() > session.expiresAt) {
      return {
        isValid: false,
        reason: 'Session has expired',
        requiresConfirmation: false,
      };
    }

    // Check session status
    if (session.status !== SessionStatus.ACTIVE) {
      return {
        isValid: false,
        reason: `Session is ${session.status}`,
        requiresConfirmation: false,
      };
    }

    // Check operation is whitelisted
    if (!session.constraints.operationWhitelist.includes(request.operation)) {
      return {
        isValid: false,
        reason: `Operation ${request.operation} not whitelisted for this session`,
        requiresConfirmation: false,
      };
    }

    // Check contract whitelist
    if (request.contractAddress && session.constraints.contractWhitelist) {
      if (!session.constraints.contractWhitelist.includes(request.contractAddress)) {
        return {
          isValid: false,
          reason: 'Contract address not whitelisted',
          requiresConfirmation: false,
        };
      }
    }

    // Check spending limit
    if (request.amount && !this.validateSpendingLimit(session, request.amount)) {
      return {
        isValid: false,
        reason: 'Spending limit exceeded',
        requiresConfirmation: false,
      };
    }

    return {
      isValid: true,
      requiresConfirmation: session.constraints.requiresConfirmation,
    };
  }

  /**
   * Validate spending against session limit
   */
  private validateSpendingLimit(session: SmartSessionConfig, amount: string): boolean {
    const sessionAmount = BigInt(session.spendingLimit.amount);
    const requestAmount = BigInt(amount);
    return requestAmount <= sessionAmount;
  }

  /**
   * Check if operation is allowed by session
   */
  isOperationAllowed(session: SmartSessionConfig, operation: SessionPermission): boolean {
    if (session.status !== SessionStatus.ACTIVE || Date.now() > session.expiresAt) {
      return false;
    }
    return session.constraints.operationWhitelist.includes(operation);
  }

  /**
   * Check if contract is whitelisted
   */
  isContractWhitelisted(session: SmartSessionConfig, contractAddress: string): boolean {
    if (!session.constraints.contractWhitelist) {
      return true; // Allow if no whitelist defined
    }
    return session.constraints.contractWhitelist.includes(contractAddress);
  }

  /**
   * Clear permission cache
   */
  clearCache(): void {
    this.permissionCache.clear();
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.permissionCache.clear();
  }
}

export const sessionPermissionManager = SessionPermissionManager.getInstance();
