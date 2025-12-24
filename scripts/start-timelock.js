// Timelock System Startup Script
const { TimelockAPI } = require('./timelockAPI');
const { DelayCalculator } = require('./delayCalculator');

async function startTimelock() {
  console.log('⏰ Starting RenVault Timelock System...\n');

  // Initialize delay calculator
  const calculator = new DelayCalculator();
  console.log('✅ Delay calculator initialized\n');

  // Start timelock API
  const timelockAPI = new TimelockAPI(3008);
  timelockAPI.start();
  console.log('✅ Timelock API server started on http://localhost:3008\n');

  console.log('Delay Presets:');
  const presets = calculator.getPresets();
  presets.forEach(preset => {
    console.log(`- ${preset.name}: ${preset.formatted}`);
  });
  console.log();

  console.log('Configuration:');
  console.log('- Min Delay: 24 hours');
  console.log('- Max Delay: 30 days');
  console.log('- Check Interval: 1 minute\n');

  // Demo scheduled transaction
  setTimeout(() => {
    const txId = timelockAPI.scheduler.scheduleTransaction(
      'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.test',
      'demo-function',
      [],
      300000 // 5 minutes
    );
    console.log(`✅ Demo transaction scheduled (ID: ${txId})\n`);
  }, 2000);

  console.log('⏰ Timelock system is ready!');
  console.log('API: http://localhost:3008');
  console.log('Scheduler: Active');
  console.log('Auto-execution: Enabled');
}

if (require.main === module) {
  startTimelock().catch(console.error);
}

module.exports = { startTimelock };