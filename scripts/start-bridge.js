// Bridge Startup Script
const { BridgeAPI } = require('./bridgeAPI');
const { ValidatorNetwork } = require('./validatorNetwork');

async function startBridge() {
  console.log('🌉 Starting RenVault Cross-Chain Bridge...\n');

  // Initialize validator network
  const validators = new ValidatorNetwork();
  console.log('✅ Validator network initialized\n');

  // Start bridge API server
  const bridgeAPI = new BridgeAPI(3002);
  bridgeAPI.start();
  console.log('✅ Bridge API server started on http://localhost:3002\n');

  // Register demo validators
  validators.registerValidator('SP1234...', 2000000, 'pubkey1');
  validators.registerValidator('SP5678...', 1500000, 'pubkey2');
  validators.registerValidator('SP9012...', 3000000, 'pubkey3');
  console.log('✅ Demo validators registered\n');

  console.log('🌉 Cross-chain bridge is ready!');
  console.log('API: http://localhost:3002');
  console.log('Supported chains: Ethereum, Bitcoin');
}

if (require.main === module) {
  startBridge().catch(console.error);
}

module.exports = { startBridge };