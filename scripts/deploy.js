const { StacksMainnet, StacksTestnet } = require('@stacks/network');

const networks = {
  mainnet: new StacksMainnet(),
  testnet: new StacksTestnet()
};

function getDeploymentInfo() {
  const deploymentAddress = 'SP3ESR2PWP83R1YM3S4QJRWPDD886KJ4YFS3FKHPY';
  const contracts = [
    'ren-vault',
    'vault-factory', 
    'governance',
    'rewards',
    'staking'
  ];
  
  console.log('RenVault Deployment Info');
  console.log('========================');
  console.log(`Address: ${deploymentAddress}`);
  console.log(`Network: Stacks Mainnet`);
  console.log(`Contracts: ${contracts.length}`);
  
  return { deploymentAddress, contracts };
}

module.exports = { getDeploymentInfo };