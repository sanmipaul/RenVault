const { StacksMainnet } = require('@stacks/network');
const { callReadOnlyFunction, standardPrincipalCV } = require('@stacks/transactions');

const network = new StacksMainnet();
const CONTRACT_ADDRESS = 'SP3ESR2PWP83R1YM3S4QJRWPDD886KJ4YFS3FKHPY';
const CONTRACT_NAME = 'ren-vault';

class LeaderboardManager {
  constructor() {
    this.users = new Map();
  }

  async updateUser(address) {
    try {
      const balanceResult = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-balance',
        functionArgs: [standardPrincipalCV(address)],
        network,
      });

      const pointsResult = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-points',
        functionArgs: [standardPrincipalCV(address)],
        network,
      });

      const userData = {
        address,
        balance: parseInt(balanceResult.value),
        points: parseInt(pointsResult.value),
        score: this.calculateScore(parseInt(balanceResult.value), parseInt(pointsResult.value)),
        lastUpdated: Date.now()
      };

      this.users.set(address, userData);
      return userData;
    } catch (error) {
      console.error(`Error updating user ${address}:`, error);
      return null;
    }
  }

  calculateScore(balance, points) {
    return (balance / 1000000) + (points * 10); // 1 STX + 10 per point
  }

  getTopUsers(limit = 10) {
    return Array.from(this.users.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  getUserRank(address) {
    const sorted = Array.from(this.users.values())
      .sort((a, b) => b.score - a.score);
    return sorted.findIndex(user => user.address === address) + 1;
  }
}

module.exports = LeaderboardManager;