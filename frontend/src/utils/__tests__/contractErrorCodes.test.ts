/**
 * contractErrorCodes tests
 *
 * Verifies that all contract error maps are structurally sound:
 * each entry has a code, name, and message, and the code key
 * matches the code field.
 */

import {
  ALL_CONTRACT_ERRORS,
  REN_VAULT_ERRORS,
  STAKING_ERRORS,
  GOVERNANCE_ERRORS,
} from '../contractErrorCodes';

describe('contractErrorCodes – structural integrity', () => {
  it('ALL_CONTRACT_ERRORS includes all expected contracts', () => {
    const expected = [
      'ren-vault',
      'multi-asset-vault',
      'staking',
      'governance',
      'timelock',
      'bridge',
      'emergency',
      'vault-factory',
      'rewards',
      'referral',
      'oracle',
      'nft-badges',
      'liquidity-pool',
      'yield-strategy',
    ];
    expected.forEach(name => {
      expect(ALL_CONTRACT_ERRORS).toHaveProperty(name);
    });
  });

  it('every entry has code, name, and message', () => {
    Object.entries(ALL_CONTRACT_ERRORS).forEach(([contractName, map]) => {
      Object.entries(map).forEach(([key, descriptor]) => {
        expect(typeof descriptor.code).toBe('number');
        expect(typeof descriptor.name).toBe('string');
        expect(descriptor.name.length).toBeGreaterThan(0);
        expect(typeof descriptor.message).toBe('string');
        expect(descriptor.message.length).toBeGreaterThan(0);
        // Key must match the code field
        expect(parseInt(key, 10)).toBe(descriptor.code);
      });
    });
  });

  it('ren-vault contains exactly 4 error codes', () => {
    expect(Object.keys(REN_VAULT_ERRORS)).toHaveLength(4);
  });

  it('staking contains 16 error codes', () => {
    expect(Object.keys(STAKING_ERRORS)).toHaveLength(16);
  });

  it('governance contains 7 error codes', () => {
    expect(Object.keys(GOVERNANCE_ERRORS)).toHaveLength(7);
  });
});
