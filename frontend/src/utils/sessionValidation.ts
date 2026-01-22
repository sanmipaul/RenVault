// utils/sessionValidation.ts
import { WalletSession } from '../services/session/SessionStorageService';

export interface SessionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates a wallet session for security and integrity
 */
export const validateWalletSession = (session: WalletSession): SessionValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!session.providerType) {
    errors.push('Missing provider type');
  }

  if (!session.address) {
    errors.push('Missing wallet address');
  }

  if (!session.publicKey) {
    errors.push('Missing public key');
  }

  if (!session.expiresAt) {
    errors.push('Missing expiration timestamp');
  }

  if (!session.sessionId) {
    errors.push('Missing session ID');
  }

  // Validate address format based on provider
  if (session.address) {
    const addressValidation = validateWalletAddress(session.address, session.providerType);
    if (!addressValidation.isValid) {
      errors.push(...addressValidation.errors);
    }
  }

  // Check expiration
  if (session.expiresAt) {
    const now = Date.now();
    const timeUntilExpiry = session.expiresAt - now;

    if (timeUntilExpiry <= 0) {
      errors.push('Session has expired');
    } else if (timeUntilExpiry < 24 * 60 * 60 * 1000) { // Less than 24 hours
      warnings.push('Session expires soon');
    }
  }

  // Validate session ID format
  if (session.sessionId && !/^session_\d+_\w+$/.test(session.sessionId)) {
    errors.push('Invalid session ID format');
  }

  // Check metadata
  if (session.metadata) {
    if (session.metadata.permissions && !Array.isArray(session.metadata.permissions)) {
      errors.push('Permissions must be an array');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates wallet address format based on provider type
 */
export const validateWalletAddress = (address: string, providerType: string): SessionValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!address || typeof address !== 'string') {
    errors.push('Address must be a non-empty string');
    return { isValid: false, errors, warnings };
  }

  // Basic format validation
  switch (providerType.toLowerCase()) {
    case 'leather':
    case 'hiro':
    case 'xverse':
      // Stacks addresses should start with SP (mainnet) or ST (testnet)
      if (!/^S[PT][0-9A-Z]{38,40}$/.test(address)) {
        errors.push('Invalid Stacks address format');
      }
      break;

    case 'walletconnect':
      // WalletConnect addresses can vary, basic validation
      if (address.length < 20) {
        errors.push('WalletConnect address too short');
      }
      break;

    default:
      warnings.push(`Unknown provider type: ${providerType}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Checks if a session needs renewal
 */
export const shouldRenewSession = (session: WalletSession): boolean => {
  if (!session.expiresAt) return true;

  const now = Date.now();
  const timeUntilExpiry = session.expiresAt - now;

  // Renew if less than 2 days remaining
  return timeUntilExpiry < 2 * 24 * 60 * 60 * 1000;
};

/**
 * Calculates session health score (0-100)
 */
export const calculateSessionHealth = (session: WalletSession): number => {
  let score = 100;

  const validation = validateWalletSession(session);
  score -= validation.errors.length * 25; // -25 for each error
  score -= validation.warnings.length * 10; // -10 for each warning

  // Reduce score based on time until expiry
  if (session.expiresAt) {
    const now = Date.now();
    const timeUntilExpiry = session.expiresAt - now;
    const daysUntilExpiry = timeUntilExpiry / (24 * 60 * 60 * 1000);

    if (daysUntilExpiry < 1) score -= 30;
    else if (daysUntilExpiry < 3) score -= 15;
    else if (daysUntilExpiry < 7) score -= 5;
  }

  return Math.max(0, Math.min(100, score));
};

/**
 * Gets session security recommendations
 */
export const getSessionSecurityRecommendations = (session: WalletSession): string[] => {
  const recommendations: string[] = [];
  const validation = validateWalletSession(session);

  if (validation.errors.length > 0) {
    recommendations.push('Fix session validation errors immediately');
  }

  if (shouldRenewSession(session)) {
    recommendations.push('Renew session to maintain security');
  }

  if (session.metadata?.permissions?.includes('admin')) {
    recommendations.push('Admin permissions detected - ensure proper access controls');
  }

  const health = calculateSessionHealth(session);
  if (health < 50) {
    recommendations.push('Session health is low - consider re-authentication');
  }

  return recommendations;
};