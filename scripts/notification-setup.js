const { execSync } = require('child_process');

function setupNotifications() {
  console.log('🔔 Setting up RenVault Notification System...');
  
  try {
    execSync('npm install', { cwd: 'notifications', stdio: 'inherit' });
    console.log('✅ Setup complete!');
    console.log('Next steps: cd notifications && npm start');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

module.exports = { setupNotifications };