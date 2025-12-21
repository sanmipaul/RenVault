// Proposal Manager
class ProposalManager {
  constructor() {
    this.proposals = new Map();
    this.votes = new Map();
    this.proposalCounter = 0;
  }

  createProposal(proposer, title, description, type = 'general') {
    const proposalId = ++this.proposalCounter;
    const proposal = {
      id: proposalId,
      proposer,
      title,
      description,
      type,
      votesFor: 0,
      votesAgainst: 0,
      status: 'active',
      createdAt: Date.now(),
      endTime: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      executed: false
    };

    this.proposals.set(proposalId, proposal);
    return proposalId;
  }

  vote(proposalId, voter, support, votingPower = 1) {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) throw new Error('Proposal not found');
    if (Date.now() > proposal.endTime) throw new Error('Voting period ended');

    const voteKey = `${proposalId}-${voter}`;
    if (this.votes.has(voteKey)) throw new Error('Already voted');

    this.votes.set(voteKey, { support, votingPower, timestamp: Date.now() });

    if (support) {
      proposal.votesFor += votingPower;
    } else {
      proposal.votesAgainst += votingPower;
    }

    return true;
  }

  executeProposal(proposalId) {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) throw new Error('Proposal not found');
    if (Date.now() < proposal.endTime) throw new Error('Voting still active');
    if (proposal.executed) throw new Error('Already executed');

    if (proposal.votesFor > proposal.votesAgainst) {
      proposal.status = 'passed';
      proposal.executed = true;
      return { success: true, result: 'executed' };
    } else {
      proposal.status = 'rejected';
      return { success: false, result: 'rejected' };
    }
  }

  getProposal(proposalId) {
    return this.proposals.get(proposalId);
  }

  getActiveProposals() {
    return Array.from(this.proposals.values())
      .filter(p => p.status === 'active' && Date.now() < p.endTime);
  }

  getProposalResults(proposalId) {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) return null;

    return {
      id: proposalId,
      title: proposal.title,
      votesFor: proposal.votesFor,
      votesAgainst: proposal.votesAgainst,
      totalVotes: proposal.votesFor + proposal.votesAgainst,
      status: proposal.status,
      passed: proposal.votesFor > proposal.votesAgainst
    };
  }
}

module.exports = { ProposalManager };