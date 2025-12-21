// Voting System with Delegation
class VotingSystem {
  constructor() {
    this.votingPower = new Map();
    this.delegations = new Map();
    this.stakingBalances = new Map();
  }

  setStakingBalance(user, balance) {
    this.stakingBalances.set(user, balance);
    this.updateVotingPower(user);
  }

  updateVotingPower(user) {
    const balance = this.stakingBalances.get(user) || 0;
    const power = Math.floor(balance / 1000000); // 1 voting power per 1M STX
    this.votingPower.set(user, Math.max(1, power));
  }

  delegate(delegator, delegate) {
    if (delegator === delegate) throw new Error('Cannot delegate to self');
    
    this.delegations.set(delegator, delegate);
    return { success: true, delegator, delegate };
  }

  undelegate(delegator) {
    this.delegations.delete(delegator);
    return { success: true, delegator };
  }

  getVotingPower(user) {
    let totalPower = this.votingPower.get(user) || 1;
    
    // Add delegated power
    for (const [delegator, delegate] of this.delegations.entries()) {
      if (delegate === user) {
        totalPower += this.votingPower.get(delegator) || 1;
      }
    }
    
    return totalPower;
  }

  getEffectiveVoter(user) {
    return this.delegations.get(user) || user;
  }

  getDelegationInfo(user) {
    const delegatedTo = this.delegations.get(user);
    const delegatedFrom = Array.from(this.delegations.entries())
      .filter(([_, delegate]) => delegate === user)
      .map(([delegator, _]) => delegator);

    return {
      user,
      delegatedTo,
      delegatedFrom,
      ownPower: this.votingPower.get(user) || 1,
      totalPower: this.getVotingPower(user)
    };
  }

  getTopVoters(limit = 10) {
    const voters = Array.from(this.votingPower.keys())
      .map(user => ({
        user,
        power: this.getVotingPower(user),
        delegations: this.getDelegationInfo(user).delegatedFrom.length
      }))
      .sort((a, b) => b.power - a.power)
      .slice(0, limit);

    return voters;
  }
}

module.exports = { VotingSystem };