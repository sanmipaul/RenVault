const { VotingSystem } = require('./votingSystem');

describe('VotingSystem', () => {
  let vs;

  beforeEach(() => {
    vs = new VotingSystem();
  });

  describe('setStakingBalance', () => {
    test('sets balance and computes voting power', () => {
      vs.setStakingBalance('alice', 5000000);
      expect(vs.votingPower.get('alice')).toBe(5);
    });

    test('zero balance gives zero voting power', () => {
      vs.setStakingBalance('alice', 0);
      expect(vs.votingPower.get('alice')).toBe(0);
    });

    test('throws if user is missing', () => {
      expect(() => vs.setStakingBalance('', 1000000)).toThrow('user is required');
    });

    test('throws if balance is negative', () => {
      expect(() => vs.setStakingBalance('alice', -1)).toThrow('balance must be a non-negative number');
    });
  });

  describe('delegate', () => {
    test('records a delegation', () => {
      const result = vs.delegate('alice', 'bob');
      expect(result.success).toBe(true);
      expect(vs.delegations.get('alice')).toBe('bob');
    });

    test('throws if delegator is missing', () => {
      expect(() => vs.delegate('', 'bob')).toThrow('delegator is required');
    });

    test('throws if delegate is missing', () => {
      expect(() => vs.delegate('alice', '')).toThrow('delegate is required');
    });

    test('throws if delegating to self', () => {
      expect(() => vs.delegate('alice', 'alice')).toThrow('Cannot delegate to self');
    });
  });

  describe('undelegate', () => {
    test('removes delegation', () => {
      vs.delegate('alice', 'bob');
      vs.undelegate('alice');
      expect(vs.delegations.has('alice')).toBe(false);
    });
  });

  describe('getVotingPower', () => {
    test('returns own power for user with no delegations', () => {
      vs.setStakingBalance('alice', 3000000);
      expect(vs.getVotingPower('alice')).toBe(3);
    });

    test('includes delegated power', () => {
      vs.setStakingBalance('alice', 2000000);
      vs.setStakingBalance('bob', 5000000);
      vs.delegate('alice', 'bob');
      expect(vs.getVotingPower('bob')).toBe(7); // 5 own + 2 delegated
    });

    test('zero balance user gets zero power', () => {
      vs.setStakingBalance('alice', 0);
      expect(vs.getVotingPower('alice')).toBe(0);
    });
  });

  describe('getTopVoters', () => {
    test('returns voters sorted by power', () => {
      vs.setStakingBalance('alice', 1000000);
      vs.setStakingBalance('bob', 5000000);
      const top = vs.getTopVoters(2);
      expect(top[0].user).toBe('bob');
    });

    test('respects limit', () => {
      vs.setStakingBalance('alice', 1000000);
      vs.setStakingBalance('bob', 2000000);
      vs.setStakingBalance('carol', 3000000);
      expect(vs.getTopVoters(2)).toHaveLength(2);
    });
  });
});
