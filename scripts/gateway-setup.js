const { execSync } = require('child_process');

function setupGateway() {
  console.log('🌐 Setting up RenVault API Gateway...');
  
  try {
    execSync('npm install', { cwd: 'gateway', stdio: 'inherit' });
    console.log('✅ Setup complete!');
    console.log('Gateway: http://localhost:8080');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

module.exports = { setupGateway };