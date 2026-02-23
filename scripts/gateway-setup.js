const { execSync } = require('child_process');

function setupGateway() {
  console.log('🌐 Setting up RenVault API Gateway...');
  
  try {
    execSync('npm install', { cwd: 'gateway', stdio: 'inherit' });
    const host = process.env.GATEWAY_HOST || 'localhost';
    const port = process.env.GATEWAY_PORT || 8080;
    console.log('✅ Setup complete!');
    console.log(`Gateway: http://${host}:${port}`);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

module.exports = { setupGateway };