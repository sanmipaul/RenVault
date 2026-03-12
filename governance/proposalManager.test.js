const { ProposalManager } = require('./proposalManager');

describe('ProposalManager', () => {
  let pm;

  beforeEach(() => {
    pm = new ProposalManager();
  });

  describe('createProposal', () => {
    test('creates a proposal and returns an id', () => {
      const id = pm.createProposal('alice', 'Upgrade Pool', 'desc');
      expect(id).toBe(1);
      expect(pm.getProposal(1)).toBeDefined();
    });

    test('increments ids', () => {
      pm.createProposal('alice', 'A', 'desc');
      expect(pm.createProposal('alice', 'B', 'desc')).toBe(2);
    });

    test('throws if proposer is missing', () => {
      expect(() => pm.createProposal('', 'Title', 'desc')).toThrow('proposer is required');
    });

    test('throws if title is missing', () => {
      expect(() => pm.createProposal('alice', '', 'desc')).toThrow('title is required');
    });
  });

  describe('vote', () => {
    test('records a for-vote', () => {
      const id = pm.createProposal('alice', 'Title', 'desc');
      pm.vote(id, 'bob', true, 3);
      expect(pm.getProposal(id).votesFor).toBe(3);
    });

    test('records an against-vote', () => {
      const id = pm.createProposal('alice', 'Title', 'desc');
      pm.vote(id, 'bob', false, 2);
      expect(pm.getProposal(id).votesAgainst).toBe(2);
    });

    test('throws if votingPower is not positive', () => {
      const id = pm.createProposal('alice', 'Title', 'desc');
      expect(() => pm.vote(id, 'bob', true, 0)).toThrow('votingPower must be a positive number');
      expect(() => pm.vote(id, 'bob', true, -5)).toThrow();
    });

    test('throws if proposal not found', () => {
      expect(() => pm.vote(999, 'bob', true)).toThrow('Proposal not found');
    });

    test('throws on double vote', () => {
      const id = pm.createProposal('alice', 'Title', 'desc');
      pm.vote(id, 'bob', true);
      expect(() => pm.vote(id, 'bob', false)).toThrow('Already voted');
    });
  });

  describe('executeProposal', () => {
    test('executes a passed proposal', () => {
      const id = pm.createProposal('alice', 'Title', 'desc');
      pm.vote(id, 'bob', true, 5);
      pm.proposals.get(id).endTime = Date.now() - 1;
      const result = pm.executeProposal(id);
      expect(result.result).toBe('executed');
      expect(pm.getProposal(id).executed).toBe(true);
    });

    test('rejects a failed proposal and marks it executed', () => {
      const id = pm.createProposal('alice', 'Title', 'desc');
      pm.vote(id, 'bob', false, 5);
      pm.proposals.get(id).endTime = Date.now() - 1;
      const result = pm.executeProposal(id);
      expect(result.result).toBe('rejected');
      expect(pm.getProposal(id).executed).toBe(true);
    });

    test('prevents re-execution of rejected proposal', () => {
      const id = pm.createProposal('alice', 'Title', 'desc');
      pm.proposals.get(id).endTime = Date.now() - 1;
      pm.executeProposal(id); // rejected (0 votes)
      expect(() => pm.executeProposal(id)).toThrow('Already executed');
    });

    test('throws if voting still active', () => {
      const id = pm.createProposal('alice', 'Title', 'desc');
      expect(() => pm.executeProposal(id)).toThrow('Voting still active');
    });
  });

  describe('getProposalResults', () => {
    test('returns null for unknown proposal', () => {
      expect(pm.getProposalResults(999)).toBeNull();
    });

    test('returns correct totals', () => {
      const id = pm.createProposal('alice', 'Title', 'desc');
      pm.vote(id, 'bob', true, 3);
      pm.vote(id, 'carol', false, 1);
      const res = pm.getProposalResults(id);
      expect(res.totalVotes).toBe(4);
      expect(res.passed).toBe(true);
    });
  });
});
