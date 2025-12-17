const { execSync } = require('child_process');

function setupAdminDashboard() {
  console.log('🔧 Setting up RenVault Admin Dashboard...');
  
  try {
    execSync('npm install', { cwd: 'admin', stdio: 'inherit' });
    console.log('✅ Setup complete!');
    console.log('Access: http://localhost:3005');
    console.log('Login: admin / renvault2024');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

module.exports = { setupAdminDashboard };