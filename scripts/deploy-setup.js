const { execSync } = require('child_process');

function setupDeployment() {
  console.log('🚀 Setting up RenVault Deployment Infrastructure...');
  
  try {
    console.log('📦 Checking Docker...');
    execSync('docker --version', { stdio: 'inherit' });
    
    console.log('☸️ Checking Kubernetes...');
    execSync('kubectl version --client', { stdio: 'inherit' });
    
    console.log('✅ Deployment tools ready!');
    console.log('Run: ./deployment/scripts/deploy.sh');
  } catch (error) {
    console.error('❌ Setup check failed:', error.message);
  }
}

module.exports = { setupDeployment };