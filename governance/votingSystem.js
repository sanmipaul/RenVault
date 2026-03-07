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
    if (power > 0) {
      this.votingPower.set(user, power);
    } else {
      // Remove the entry entirely so the user has no governance weight
      // until they stake. Keeping a phantom entry of 1 would let any
      // zero-balance address vote and receive delegations.
      this.votingPower.delete(user);
    }
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
    // A user who has delegated their own vote away contributes 0 here;
    // their power is counted at their delegate instead.
    const hasDelegatedAway = this.delegations.has(user);
    let totalPower = hasDelegatedAway ? 0 : (this.votingPower.get(user) || 0);

    // Add the own-power of each direct delegator who has NOT themselves
    // delegated away (chained delegation is not supported; only direct
    // delegators contribute).
    for (const [delegator, delegate] of this.delegations.entries()) {
      if (delegate === user && !this.delegations.has(delegator)) {
        totalPower += this.votingPower.get(delegator) || 0;
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