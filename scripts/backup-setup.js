const { execSync } = require('child_process');

function setupBackupSystem() {
  console.log('💾 Setting up RenVault Backup System...');
  
  try {
    execSync('npm install', { cwd: 'backup', stdio: 'inherit' });
    console.log('✅ Setup complete!');
    console.log('Next steps: cd backup && npm start');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

module.exports = { setupBackupSystem };