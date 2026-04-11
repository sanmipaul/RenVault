/**
 * ContractErrorMapper unit tests
 */

import { ContractErrorMapper, ContractError } from '../contractErrorMapper';

describe('ContractErrorMapper.parseErrorCode', () => {
  it('parses "(err u102)" Clarity string', () => {
    expect(ContractErrorMapper.parseErrorCode('(err u102)')).toBe(102);
  });

  it('parses "u102" shorthand', () => {
    expect(ContractErrorMapper.parseErrorCode('u102')).toBe(102);
  });

  it('parses plain numeric string "102"', () => {
    expect(ContractErrorMapper.parseErrorCode('102')).toBe(102);
  });

  it('parses plain number 102', () => {
    expect(ContractErrorMapper.parseErrorCode(102)).toBe(102);
  });

  it('parses Error object with "(err u101)" in message', () => {
    expect(ContractErrorMapper.parseErrorCode(new Error('Transaction abort: (err u101)'))).toBe(101);
  });

  it('parses broadcast response object with reason_data.error', () => {
    const broadcastError = {
      error: 'transaction rejected',
      reason: 'AbortedByResponse',
      reason_data: { type: 'AbortedByResponse', error: '(err u102)' },
    };
    expect(ContractErrorMapper.parseErrorCode(broadcastError)).toBe(102);
  });

  it('returns null for null input', () => {
    expect(ContractErrorMapper.parseErrorCode(null)).toBeNull();
  });

  it('returns null for unrecognised string', () => {
    expect(ContractErrorMapper.parseErrorCode('not an error')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(ContractErrorMapper.parseErrorCode('')).toBeNull();
  });
});

describe('ContractErrorMapper.lookup', () => {
  it('returns descriptor for ren-vault u102', () => {
    const d = ContractErrorMapper.lookup(102, 'ren-vault');
    expect(d).not.toBeNull();
    expect(d!.name).toBe('err-insufficient-balance');
  });

  it('returns null for unknown code', () => {
    expect(ContractErrorMapper.lookup(9999, 'ren-vault')).toBeNull();
  });

  it('returns null for unknown contract', () => {
    expect(ContractErrorMapper.lookup(102, 'non-existent-contract')).toBeNull();
  });

  it('resolves staking u405 to lock-period error', () => {
    const d = ContractErrorMapper.lookup(405, 'staking');
    expect(d).not.toBeNull();
    expect(d!.name).toBe('err-lock-period-active');
  });
});

describe('ContractErrorMapper.map', () => {
  it('maps "(err u101)" to ren-vault invalid-amount message', () => {
    const d = ContractErrorMapper.map('(err u101)', 'ren-vault');
    expect(d.name).toBe('err-invalid-amount');
    expect(d.message).toContain('invalid');
  });

  it('maps unknown code to generic error with code in message', () => {
    const d = ContractErrorMapper.map('(err u9999)', 'ren-vault');
    expect(d.code).toBe(9999);
    expect(d.message).toContain('9999');
  });

  it('maps post-condition string to post-condition descriptor', () => {
    const d = ContractErrorMapper.map('PostConditionFailed: spending exceeds', 'ren-vault');
    expect(d.name).toBe('post-condition-failed');
  });

  it('maps PostCondition Error object correctly', () => {
    const d = ContractErrorMapper.map(new Error('PostConditionFailed'), 'ren-vault');
    expect(d.name).toBe('post-condition-failed');
  });

  it('falls back to UNKNOWN_ERROR for null input', () => {
    const d = ContractErrorMapper.map(null, 'ren-vault');
    expect(d.code).toBe(-1);
  });

  it('maps governance u409 to proposal-failed', () => {
    const d = ContractErrorMapper.map(409, 'governance');
    expect(d.name).toBe('err-proposal-failed');
  });
});

describe('ContractErrorMapper.toStatusMessage', () => {
  it('appends hint when available', () => {
    const msg = ContractErrorMapper.toStatusMessage('(err u102)', 'ren-vault');
    // hint is "Check your vault balance and try a smaller amount."
    expect(msg).toContain('vault balance');
  });

  it('returns just the message when no hint is defined', () => {
    const msg = ContractErrorMapper.toStatusMessage('(err u401)', 'staking');
    expect(msg).toContain('Unauthorized');
    expect(msg).not.toContain('undefined');
  });
});

describe('ContractErrorMapper.isContractError', () => {
  it('returns true for a Clarity error string', () => {
    expect(ContractErrorMapper.isContractError('(err u101)')).toBe(true);
  });

  it('returns false for a generic message', () => {
    expect(ContractErrorMapper.isContractError('Network timeout')).toBe(false);
  });
});

describe('ContractErrorMapper.mapToError', () => {
  it('returns a ContractError instance', () => {
    const err = ContractErrorMapper.mapToError('(err u103)', 'ren-vault');
    expect(err).toBeInstanceOf(ContractError);
    expect(err.descriptor.name).toBe('err-transfer-failed');
    expect(err.contractName).toBe('ren-vault');
  });

  it('ContractError message equals descriptor message', () => {
    const err = ContractErrorMapper.mapToError('(err u102)', 'ren-vault');
    expect(err.message).toBe(err.descriptor.message);
  });
});

describe('ContractErrorMapper.getErrorSuggestion', () => {
  it('returns the hint when one exists', () => {
    const hint = ContractErrorMapper.getErrorSuggestion('(err u102)', 'ren-vault');
    expect(hint).toContain('vault balance');
  });

  it('returns empty string when no hint is defined', () => {
    const hint = ContractErrorMapper.getErrorSuggestion('(err u401)', 'staking');
    expect(hint).toBe('');
  });

  it('returns empty string for unknown code', () => {
    const hint = ContractErrorMapper.getErrorSuggestion('(err u9999)', 'ren-vault');
    expect(hint).toBe('');
  });
});

describe('parseStacksBroadcastError', () => {
  // Import inline since we added it after the main import
  const { parseStacksBroadcastError } = require('../contractErrorMapper');

  it('extracts descriptor from reason_data.error field', () => {
    const body = {
      error: 'transaction rejected',
      reason: 'AbortedByResponse',
      reason_data: { type: 'AbortedByResponse', error: '(err u102)' },
    };
    const d = parseStacksBroadcastError(body, 'ren-vault');
    expect(d).not.toBeNull();
    expect(d!.name).toBe('err-insufficient-balance');
  });

  it('returns null when no error code is present', () => {
    const body = { error: 'bad request', reason: 'NoSuchContract' };
    expect(parseStacksBroadcastError(body, 'ren-vault')).toBeNull();
  });
});

describe('Per-contract spot checks', () => {
  const cases: [string, number, string][] = [
    ['multi-asset-vault', 106, 'err-contract-paused'],
    ['staking', 411, 'err-exceeds-max-stake'],
    ['timelock', 402, 'err-not-ready'],
    ['bridge', 403, 'err-bridge-paused'],
    ['emergency', 402, 'err-already-paused'],
    ['vault-factory', 201, 'err-vault-exists'],
    ['rewards', 400, 'err-no-rewards'],
    ['referral', 402, 'err-self-referral'],
    ['oracle', 402, 'err-stale-price'],
    ['nft-badges', 501, 'err-not-token-owner'],
    ['liquidity-pool', 103, 'err-pool-not-found'],
    ['yield-strategy', 403, 'err-strategy-paused'],
  ];

  test.each(cases)('%s u%i → %s', (contract, code, expectedName) => {
    const d = ContractErrorMapper.lookup(code, contract);
    expect(d).not.toBeNull();
    expect(d!.name).toBe(expectedName);
  });
});
