const { StacksMainnet } = require('@stacks/network');
const { makeContractDeploy, broadcastTransaction, AnchorMode } = require('@stacks/transactions');
const { readFileSync } = require('fs');

const network = new StacksMainnet();
const privateKey = process.env.MAINNET_PRIVATE_KEY;

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
  const contractPath = contractName === 'vault-trait' ? 
    `contracts/traits/${contractName}.clar` : 
    `contracts/${contractName}.clar`;
  
  const contractSource = readFileSync(contractPath, 'utf8');
  
  const txOptions = {
    contractName,
    codeBody: contractSource,
    senderKey: privateKey,
    network,
    anchorMode: AnchorMode.Any,
    fee: 500000,
  };

  const transaction = await makeContractDeploy(txOptions);
  const result = await broadcastTransaction(transaction, network);
  
  console.log(`✅ Deployed ${contractName}: ${result.txid}`);
  return result;
}

async function deployMainnet() {
  console.log('🚀 Starting mainnet deployment...');
  
  for (const contract of contracts) {
    try {
      await deployContract(contract);
      console.log(`⏳ Waiting 60s before next deployment...`);
      await new Promise(resolve => setTimeout(resolve, 60000));
    } catch (error) {
      console.error(`❌ Failed to deploy ${contract}:`, error);
      break;
    }
  }
  
  console.log('🎉 Mainnet deployment complete!');
}

if (!privateKey) {
  console.error('❌ MAINNET_PRIVATE_KEY environment variable required');
  process.exit(1);
}

deployMainnet();