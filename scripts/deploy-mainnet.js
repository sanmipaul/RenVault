const { StacksMainnet } = require('@stacks/network');
const { makeContractDeploy, broadcastTransaction, AnchorMode, getAddressFromPrivateKey, TransactionVersion } = require('@stacks/transactions');
const { readFileSync } = require('fs');
const { generateWallet } = require('@stacks/wallet-sdk');
const toml = require('toml');

async function initialize() {
  // Read Mainnet.toml configuration
  const configPath = 'settings/Mainnet.toml';
  const configFile = readFileSync(configPath, 'utf8');
  const config = toml.parse(configFile);

  const network = new StacksMainnet();

  // Get mnemonic from config or environment variable
  const mnemonic = process.env.MAINNET_MNEMONIC || config.accounts?.deployer?.mnemonic;
  const privateKeyFromEnv = process.env.MAINNET_PRIVATE_KEY;

  // Get deployment fee rate from config
  const deploymentFeeRate = config.network?.deployment_fee_rate || 10;
  console.log(`Using deployment fee rate: ${deploymentFeeRate} microSTX`);

  let privateKey;
  if (mnemonic) {
    // Use proper Stacks wallet derivation
    const wallet = await generateWallet({
      secretKey: mnemonic,
      password: ''
    });
    privateKey = wallet.accounts[0].stxPrivateKey;
    const address = getAddressFromPrivateKey(privateKey, TransactionVersion.Mainnet);
    console.log(`Deploying from address: ${address}`);
  } else if (privateKeyFromEnv) {
    privateKey = privateKeyFromEnv;
  } else {
    console.error('❌ Either MAINNET_MNEMONIC or MAINNET_PRIVATE_KEY environment variable required');
    process.exit(1);
  }

  return { network, privateKey, deploymentFeeRate };
}

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

async function deployContract(contractName, privateKey, network, deploymentFeeRate) {
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
    fee: deploymentFeeRate,
  };

  const transaction = await makeContractDeploy(txOptions);
  const result = await broadcastTransaction(transaction, network);

  console.log(`✅ Deployed ${contractName}: ${result.txid}`);
  return result;
}

async function deployMainnet() {
  const { network, privateKey, deploymentFeeRate } = await initialize();

  console.log('🚀 Starting mainnet deployment...');

  for (const contract of contracts) {
    try {
      await deployContract(contract, privateKey, network, deploymentFeeRate);
      console.log(`⏳ Waiting 60s before next deployment...`);
      await new Promise(resolve => setTimeout(resolve, 60000));
    } catch (error) {
      console.error(`❌ Failed to deploy ${contract}:`, error);
      break;
    }
  }

  console.log('🎉 Mainnet deployment complete!');
}

deployMainnet();