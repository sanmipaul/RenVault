// Input validation utilities for the Staking API
const MAX_ADDRESS_LENGTH = 128;
const MAX_LEADERBOARD_LIMIT = 100;
const MAX_HISTORY_LIMIT = 200;
const DEFAULT_LEADERBOARD_LIMIT = 10;
const DEFAULT_HISTORY_LIMIT = 50;
const MAX_REWARD_RATE = 0.2;
const MIN_REWARD_RATE = 0.0001;
const MAX_SAFE_AMOUNT = Number.MAX_SAFE_INTEGER;

/**
 * Validate a staker address string.
 * Returns { valid: true } or { valid: false, error: string }.
 */
function validateAddress(address) {
  if (address === undefined || address === null) {
    return { valid: false, error: 'Address is required' };
  }
  if (typeof address !== 'string') {
    return { valid: false, error: 'Address must be a string' };
  }
  if (address.trim().length === 0) {
    return { valid: false, error: 'Address cannot be empty' };
  }
  if (address.length > MAX_ADDRESS_LENGTH) {
    return { valid: false, error: `Address must not exceed ${MAX_ADDRESS_LENGTH} characters` };
  }
  return { valid: true };
}

/**
 * Validate a microSTX amount.
 * Must be a positive finite integer.
 */
function validateAmount(amount) {
  if (amount === undefined || amount === null) {
    return { valid: false, error: 'Amount is required' };
  }
  const parsed = Number(amount);
  if (!Number.isFinite(parsed)) {
    return { valid: false, error: 'Amount must be a finite number' };
  }
  if (parsed <= 0) {
    return { valid: false, error: 'Amount must be positive' };
  }
  if (!Number.isInteger(parsed)) {
    return { valid: false, error: 'Amount must be an integer (microSTX units)' };
  }
  if (parsed > MAX_SAFE_AMOUNT) {
    return { valid: false, error: 'Amount exceeds maximum safe integer' };
  }
  return { valid: true, value: parsed };
}

/**
 * Validate a reward rate.
 * Must be a finite number within the allowed band.
 */
function validateRate(rate) {
  if (rate === undefined || rate === null) {
    return { valid: false, error: 'Rate is required' };
  }
  const parsed = Number(rate);
  if (!Number.isFinite(parsed)) {
    return { valid: false, error: 'Rate must be a finite number' };
  }
  if (parsed < MIN_REWARD_RATE || parsed > MAX_REWARD_RATE) {
    return {
      valid: false,
      error: `Rate must be between ${MIN_REWARD_RATE} and ${MAX_REWARD_RATE}`
    };
  }
  return { valid: true, value: parsed };
}

/**
 * Clamp a query-param limit to a safe integer range.
 * Falls back to defaultValue when the input is not a valid integer.
 */
function clampLimit(value, min, max, defaultValue) {
  const parsed = parseInt(value, 10);
  if (!Number.isFinite(parsed)) return defaultValue;
  return Math.min(Math.max(parsed, min), max);
}

module.exports = {
  validateAddress,
  validateAmount,
  validateRate,
  clampLimit,
  MAX_ADDRESS_LENGTH,
  MAX_LEADERBOARD_LIMIT,
  MAX_HISTORY_LIMIT,
  DEFAULT_LEADERBOARD_LIMIT,
  DEFAULT_HISTORY_LIMIT,
};
