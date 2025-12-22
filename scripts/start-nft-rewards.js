// NFT Rewards Startup Script
const { RewardsAPI } = require('./rewardsAPI');
const { BadgeGenerator } = require('./badgeGenerator');

async function startNFTRewards() {
  console.log('🏆 Starting RenVault NFT Rewards System...\n');

  // Initialize badge generator
  const generator = new BadgeGenerator();
  console.log('✅ Badge generator initialized\n');

  // Start rewards API
  const rewardsAPI = new RewardsAPI(3005);
  rewardsAPI.start();
  console.log('✅ Rewards API server started on http://localhost:3005\n');

  // Simulate achievement tracking
  setTimeout(() => {
    rewardsAPI.tracker.trackUserActivity('SP1234...', {
      type: 'deposit',
      amount: 1000000
    });
    console.log('✅ Demo achievement tracked\n');
  }, 2000);

  console.log('🏆 NFT Rewards system is ready!');
  console.log('API: http://localhost:3005');
  console.log('Achievements: First Steps, Whale Status, Diamond Hands, Early Adopter');
}

if (require.main === module) {
  startNFTRewards().catch(console.error);
}

module.exports = { startNFTRewards };