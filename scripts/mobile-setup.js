const { execSync } = require('child_process');

function setupMobileApp() {
  console.log('🚀 Setting up RenVault Mobile App...');
  
  try {
    console.log('📦 Installing dependencies...');
    execSync('npm install', { cwd: 'mobile', stdio: 'inherit' });
    
    console.log('✅ Mobile app setup complete!');
    console.log('Next steps:');
    console.log('1. cd mobile');
    console.log('2. npm start');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

module.exports = { setupMobileApp };