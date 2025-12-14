const fs = require('fs');
const path = require('path');

function validateContracts() {
  const contractsDir = path.join(__dirname, '..', 'contracts');
  const contracts = fs.readdirSync(contractsDir)
    .filter(file => file.endsWith('.clar'));

  console.log('Contract Validation Report');
  console.log('=========================');
  
  contracts.forEach(contract => {
    const contractPath = path.join(contractsDir, contract);
    const content = fs.readFileSync(contractPath, 'utf8');
    
    const hasDefinePublic = content.includes('define-public');
    const hasDefineReadOnly = content.includes('define-read-only');
    const hasErrorHandling = content.includes('asserts!');
    
    console.log(`${contract}: ${hasDefinePublic ? '✓' : '✗'} ${hasDefineReadOnly ? '✓' : '✗'} ${hasErrorHandling ? '✓' : '✗'}`);
  });
  
  return contracts.length;
}

module.exports = { validateContracts };
