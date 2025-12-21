// Governance API Server
const express = require('express');
const { ProposalManager } = require('./proposalManager');
const { VotingSystem } = require('./votingSystem');

class GovernanceAPI {
  constructor(port = 3004) {
    this.app = express();
    this.port = port;
    this.proposals = new ProposalManager();
    this.voting = new VotingSystem();
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(express.json());

    this.app.post('/api/proposals', (req, res) => {
      try {
        const { proposer, title, description, type } = req.body;
        const proposalId = this.proposals.createProposal(proposer, title, description, type);
        res.json({ success: true, proposalId });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.get('/api/proposals', (req, res) => {
      const active = this.proposals.getActiveProposals();
      res.json({ proposals: active });
    });

    this.app.get('/api/proposals/:id', (req, res) => {
      const proposal = this.proposals.getProposal(parseInt(req.params.id));
      if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
      res.json(proposal);
    });

    this.app.post('/api/vote', (req, res) => {
      try {
        const { proposalId, voter, support } = req.body;
        const effectiveVoter = this.voting.getEffectiveVoter(voter);
        const votingPower = this.voting.getVotingPower(effectiveVoter);
        
        this.proposals.vote(proposalId, effectiveVoter, support, votingPower);
        res.json({ success: true, votingPower });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.post('/api/delegate', (req, res) => {
      try {
        const { delegator, delegate } = req.body;
        const result = this.voting.delegate(delegator, delegate);
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.get('/api/voting-power/:user', (req, res) => {
      const info = this.voting.getDelegationInfo(req.params.user);
      res.json(info);
    });

    this.app.get('/api/top-voters', (req, res) => {
      const voters = this.voting.getTopVoters();
      res.json({ voters });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Governance API server running on port ${this.port}`);
    });
  }
}

module.exports = { GovernanceAPI };