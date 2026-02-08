const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Liquidity Pool System...\n');

const liquidityPath = path.join(__dirname, '..', 'liquidity');

// Start liquidity API
const liquidityAPI = spawn('node', ['liquidityAPI.js'], {
  cwd: liquidityPath,
  stdio: 'inherit'
});

liquidityAPI.on('error', (error) => {
  console.error('❌ Failed to start Liquidity API:', error);
});

liquidityAPI.on('close', (code) => {
  console.log(`Liquidity API exited with code ${code}`);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Liquidity Pool System...');
  liquidityAPI.kill();
  process.exit();
});

console.log('✅ Liquidity Pool System started');
console.log('📊 API: http://localhost:3011');
console.log('Press Ctrl+C to stop\n');
