// Staking System Startup Script
const { StakingAPI } = require('./stakingAPI');
const { YieldCalculator } = require('./yieldCalculator');

async function startStaking() {
  console.log('💰 Starting RenVault Staking System...\n');

  // Initialize yield calculator
  const calculator = new YieldCalculator();
  console.log('✅ Yield calculator initialized\n');

  // Start staking API
  const stakingAPI = new StakingAPI(3010);
  stakingAPI.start();
  console.log('✅ Staking API server started on http://localhost:3010\n');

  console.log('Staking Parameters:');
  console.log('- Reward Rate: 1% per epoch');
  console.log('- Minimum Stake: 1 STX');
  console.log('- Lock Period: 24 hours');
  console.log('- Distribution: Daily automated\n');

  // Demo yield calculations
  setTimeout(() => {
    const demoStake = 10000000; // 10 STX
    const returns = calculator.calculateStakingReturns(demoStake, 365);
    
    console.log('Demo Yield Calculation (10 STX, 1 year):');
    console.log(`- Simple Yield: ${(returns.simpleYield / 1000000).toFixed(4)} STX`);
    console.log(`- Compound Yield: ${(returns.compoundYield / 1000000).toFixed(4)} STX`);
    console.log(`- APY: ${(returns.apy * 100).toFixed(2)}%\n`);

    // Demo staking
    try {
      const stakeResult = stakingAPI.stakingManager.stake('SP1234567890DEMO', 5000000);
      console.log(`✅ Demo stake created: ${stakeResult.newStake / 1000000} STX\n`);
    } catch (error) {
      console.log('Demo staking setup skipped\n');
    }
  }, 2000);

  console.log('💰 Staking system is ready!');
  console.log('API: http://localhost:3010');
  console.log('Features: Stake, Unstake, Rewards, Leaderboard');
  console.log('Auto-distribution: Active');
}

if (require.main === module) {
  startStaking().catch(console.error);
}

module.exports = { startStaking };