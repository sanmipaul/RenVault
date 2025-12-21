// Yield Strategies Startup Script
const { YieldAPI } = require('./yieldAPI');
const { AutoCompounder } = require('./autoCompounder');

async function startYieldStrategies() {
  console.log('🌾 Starting RenVault Yield Strategies...\n');

  // Start yield API server
  const yieldAPI = new YieldAPI(3003);
  yieldAPI.start();
  console.log('✅ Yield API server started on http://localhost:3003\n');

  // Initialize auto-compounder
  const compounder = new AutoCompounder();
  console.log('✅ Auto-compounder initialized\n');

  // Start compounding cycle
  setInterval(async () => {
    const results = await compounder.runCompoundingCycle();
    if (results.length > 0) {
      console.log(`🔄 Compounded rewards for ${results.length} users`);
    }
  }, 3600000); // Every hour

  console.log('🌾 Yield strategies are ready!');
  console.log('API: http://localhost:3003');
  console.log('Strategies: Staking (5%), Liquidity (8%), Lending (3%)');
}

if (require.main === module) {
  startYieldStrategies().catch(console.error);
}

module.exports = { startYieldStrategies };