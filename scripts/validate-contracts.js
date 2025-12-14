const fs = require('fs');
const path = require('path');

const contractsDir = 'contracts';
const contracts = [
  'sip009-nft-trait.clar',
  'traits/vault-trait.clar', 
  'oracle.clar',
  'emergency.clar',
  'analytics.clar',
  'governance.clar',
  'rewards.clar',
  'timelock.clar',
  'nft-badges.clar',
  'staking.clar',
  'referral.clar',
  'vault-factory.clar',
  'ren-vault.clar'
];

console.log('Validating contract files...');

contracts.forEach(contract => {
  const filePath = path.join(contractsDir, contract);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`✅ ${contract} - ${content.length} bytes`);
  } else {
    console.log(`❌ ${contract} - File not found`);
  }
});

console.log('\nContract validation complete!');