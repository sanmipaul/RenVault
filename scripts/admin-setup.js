const { execSync } = require('child_process');

function setupAdminDashboard() {
  console.log('🔧 Setting up RenVault Admin Dashboard...');
  
  try {
    execSync('npm install', { cwd: 'admin', stdio: 'inherit' });
    const host = process.env.ADMIN_HOST || 'localhost';
    const port = process.env.ADMIN_PORT || 3005;
    console.log('✅ Setup complete!');
    console.log(`Access: http://${host}:${port}`);
    console.log('Login: admin / renvault2024');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

module.exports = { setupAdminDashboard };