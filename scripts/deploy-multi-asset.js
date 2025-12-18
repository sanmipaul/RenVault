// Multi-Asset Deployment Script
const { StacksTestnet } = require('@stacks/network');
const { makeContractDeploy, broadcastTransaction } = require('@stacks/transactions');

async function deployMultiAsset() {
  const network = new StacksTestnet();
  
  const contracts = [
    'multi-asset-vault.clar',
    'asset-manager.clar',
    'traits/sip010-trait.clar'
  ];

  for (const contract of contracts) {
    console.log(`Deploying ${contract}...`);
    
    const txOptions = {
      contractName: contract.split('.')[0],
      codeBody: require('fs').readFileSync(`./contracts/${contract}`, 'utf8'),
      senderKey: process.env.PRIVATE_KEY,
      network
    };

    const transaction = await makeContractDeploy(txOptions);
    const result = await broadcastTransaction(transaction, network);
    
    console.log(`Deployed ${contract}: ${result.txid}`);
  }
}

deployMultiAsset().catch(console.error);