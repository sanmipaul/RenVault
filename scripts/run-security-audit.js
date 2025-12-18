// Security Audit Automation Script
const { execSync } = require('child_process');
const fs = require('fs');

async function runSecurityAudit() {
  console.log('🔒 Starting RenVault Security Audit...\n');

  // Run Clarinet check
  console.log('1. Running Clarinet syntax check...');
  try {
    execSync('clarinet check', { stdio: 'inherit' });
    console.log('✅ Syntax check passed\n');
  } catch (error) {
    console.log('❌ Syntax check failed\n');
  }

  // Run security tests
  console.log('2. Running security tests...');
  try {
    execSync('clarinet test tests/security_test.ts', { stdio: 'inherit' });
    console.log('✅ Security tests passed\n');
  } catch (error) {
    console.log('❌ Security tests failed\n');
  }

  // Run vulnerability scan
  console.log('3. Running vulnerability scan...');
  try {
    execSync('node security/cli.js audit', { stdio: 'inherit' });
    console.log('✅ Vulnerability scan completed\n');
  } catch (error) {
    console.log('❌ Vulnerability scan failed\n');
  }

  // Generate full report
  console.log('4. Generating security report...');
  try {
    execSync('node security/cli.js full', { stdio: 'inherit' });
    console.log('✅ Security report generated\n');
  } catch (error) {
    console.log('❌ Report generation failed\n');
  }

  console.log('🔒 Security audit completed!');
}

if (require.main === module) {
  runSecurityAudit().catch(console.error);
}

module.exports = { runSecurityAudit };