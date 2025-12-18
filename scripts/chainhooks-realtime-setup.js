const { execSync } = require('child_process');

function setupRealtimeProcessing() {
  console.log('⚡ Setting up RenVault Real-time Event Processing...');
  
  try {
    console.log('📦 Installing dependencies...');
    execSync('npm install ws axios', { cwd: 'chainhooks', stdio: 'inherit' });
    
    console.log('✅ Setup complete!');
    console.log('Start: node chainhooks/integrationServer.js');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

module.exports = { setupRealtimeProcessing };