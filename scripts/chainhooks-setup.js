const { execSync } = require('child_process');

function setupChainhooks() {
  console.log('🪝 Setting up RenVault Chainhooks Integration...');
  
  try {
    execSync('npm install', { cwd: 'chainhooks', stdio: 'inherit' });
    console.log('✅ Setup complete!');
    console.log('Next steps:');
    console.log('1. cd chainhooks && npm start');
    console.log('2. node monitor.js start');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

module.exports = { setupChainhooks };