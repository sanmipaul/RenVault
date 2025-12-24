// Oracle System Startup Script
const { OracleAPI } = require('./oracleAPI');
const { PriceValidator } = require('./priceValidator');

async function startOracle() {
  console.log('🔮 Starting RenVault Oracle System...\n');

  // Initialize price validator
  const validator = new PriceValidator();
  console.log('✅ Price validator initialized\n');

  // Start oracle API
  const oracleAPI = new OracleAPI(3007);
  oracleAPI.start();
  console.log('✅ Oracle API server started on http://localhost:3007\n');

  console.log('Price Feeds:');
  console.log('- STX/USD: Real-time updates');
  console.log('- BTC/USD: Real-time updates');
  console.log('- ETH/USD: Real-time updates\n');

  console.log('Data Sources:');
  console.log('- Coinbase (Weight: 3)');
  console.log('- Binance (Weight: 2)');
  console.log('- CoinGecko (Weight: 1)\n');

  console.log('🔮 Oracle system is ready!');
  console.log('API: http://localhost:3007');
  console.log('Update Interval: 1 minute');
  console.log('Price Validation: Active');
}

if (require.main === module) {
  startOracle().catch(console.error);
}

module.exports = { startOracle };