const { execSync } = require('child_process');

function runTests() {
  console.log('RenVault Test Runner');
  console.log('===================');
  
  try {
    const result = execSync('clarinet test --coverage', { encoding: 'utf8' });
    console.log(result);
    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Tests failed:', error.stdout);
    process.exit(1);
  }
}

module.exports = { runTests };