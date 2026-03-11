const { ProposalManager } = require('./proposalManager');
const { VotingSystem } = require('./votingSystem');

// ─────────────────────────────────────────────────────────────────────────────
// ProposalManager
// ─────────────────────────────────────────────────────────────────────────────

describe('ProposalManager.executeProposal', () => {
  let manager;

  function makeExpiredProposal(votesFor, votesAgainst) {
    const id = manager.createProposal('proposer', 'Test', 'Description');
    const proposal = manager.getProposal(id);
    // Back-date so the voting period is over
    proposal.endTime = Date.now() - 1;
    proposal.votesFor = votesFor;
    proposal.votesAgainst = votesAgainst;
    return id;
  }

  beforeEach(() => {
    manager = new ProposalManager();
  });

  test('passed proposal is marked executed and cannot be executed again', () => {
    const id = makeExpiredProposal(10, 5);
    const result = manager.executeProposal(id);

    expect(result.success).toBe(true);
    expect(result.result).toBe('executed');
    expect(manager.getProposal(id).executed).toBe(true);

    expect(() => manager.executeProposal(id)).toThrow('Already executed');
  });

  test('rejected proposal is marked executed and cannot be executed again', () => {
    const id = makeExpiredProposal(3, 10);
    const result = manager.executeProposal(id);

    expect(result.success).toBe(false);
    expect(result.result).toBe('rejected');
    // The critical fix: executed must be true even on rejection
    expect(manager.getProposal(id).executed).toBe(true);

    expect(() => manager.executeProposal(id)).toThrow('Already executed');
  });

  test('tied vote counts as rejected and seals the proposal', () => {
    const id = makeExpiredProposal(5, 5);
    manager.executeProposal(id);

    expect(manager.getProposal(id).status).toBe('rejected');
    expect(manager.getProposal(id).executed).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// VotingSystem — zero-balance voting power
// ─────────────────────────────────────────────────────────────────────────────

describe('VotingSystem — zero-balance addresses have no voting power', () => {
  let vs;

  beforeEach(() => {
    vs = new VotingSystem();
  });

  test('a freshly registered address with no stake has 0 voting power', () => {
    vs.setStakingBalance('addr1', 0);
    expect(vs.getVotingPower('addr1')).toBe(0);
  });

  test('an address unknown to the system has 0 voting power', () => {
    expect(vs.getVotingPower('unknown')).toBe(0);
  });

  test('staking 1M STX grants 1 voting power', () => {
    vs.setStakingBalance('addr1', 1_000_000);
    expect(vs.getVotingPower('addr1')).toBe(1);
  });

  test('unstaking back to zero removes voting power', () => {
    vs.setStakingBalance('addr1', 2_000_000);
    vs.setStakingBalance('addr1', 0);
    expect(vs.getVotingPower('addr1')).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// VotingSystem — delegation double-counting
// ─────────────────────────────────────────────────────────────────────────────

describe('VotingSystem — delegation does not double-count power', () => {
  let vs;

  beforeEach(() => {
    vs = new VotingSystem();
    vs.setStakingBalance('A', 3_000_000); // 3 votes
    vs.setStakingBalance('B', 2_000_000); // 2 votes
    vs.setStakingBalance('C', 1_000_000); // 1 vote
  });

  test('direct delegation: delegate receives delegator power, delegator contributes 0', () => {
    vs.delegate('A', 'B');

    // B gets A's 3 votes on top of its own 2
    expect(vs.getVotingPower('B')).toBe(5);
    // A has delegated away — contributes 0 at its own address
    expect(vs.getVotingPower('A')).toBe(0);
  });

  test('chained delegation A to B to C: power appears only at C, not at B too', () => {
    vs.delegate('A', 'B');
    vs.delegate('B', 'C');

    // C gets B's 2 votes; A→B is a chained delegator so A's 3 are NOT
    // double-counted at C (B already delegated away its own power).
    // C's total = C's own 1 + B's own 2 = 3
    expect(vs.getVotingPower('C')).toBe(3);

    // B delegated to C, so B contributes 0 at its own address
    expect(vs.getVotingPower('B')).toBe(0);

    // A delegated to B, so A contributes 0 at its own address
    expect(vs.getVotingPower('A')).toBe(0);
  });

  test('undelegating restores the delegator own power', () => {
    vs.delegate('A', 'B');
    vs.undelegate('A');

    expect(vs.getVotingPower('A')).toBe(3);
    expect(vs.getVotingPower('B')).toBe(2);
  });
});
