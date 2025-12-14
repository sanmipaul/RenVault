const { StacksTestnet, StacksMainnet } = require('@stacks/network');
const { makeContractDeploy, broadcastTransaction, AnchorMode } = require('@stacks/transactions');
const { readFileSync } = require('fs');

const network = new StacksTestnet();
const privateKey = process.env.PRIVATE_KEY || 'your-private-key-here';

const contracts = [
  'sip009-nft-trait',
  'vault-trait', 
  'oracle',
  'emergency',
  'analytics',
  'governance',
  'rewards',
  'timelock',
  'nft-badges',
  'staking',
  'referral',
  'vault-factory',
  'ren-vault'
];

async function deployContract(contractName) {
  const contractSource = readFileSync(`contracts/${contractName}.clar`, 'utf8');
  
  const txOptions = {
    contractName,
    codeBody: contractSource,
    senderKey: privateKey,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractDeploy(txOptions);
  const result = await broadcastTransaction(transaction, network);
  
  console.log(`Deployed ${contractName}: ${result.txid}`);
  return result;
}

async function deployAll() {
  console.log('Starting deployment of 12 contracts...');
  
  for (const contract of contracts) {
    try {
      await deployContract(contract);
      await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30s between deployments
    } catch (error) {
      console.error(`Failed to deploy ${contract}:`, error);
    }
  }
  
  console.log('Deployment complete!');
}

deployAll();