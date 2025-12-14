const { StacksMainnet } = require('@stacks/network');
const { makeContractDeploy, broadcastTransaction, AnchorMode, makeSTXTokenTransfer } = require('@stacks/transactions');
const { readFileSync } = require('fs');

const network = new StacksMainnet({ url: 'https://api.hiro.so' });
const mnemonic = "return clap bracket spawn camp badge ball chair fury enrich match bar tumble mention expect width cherry raccoon shoe live crush must robust liar";

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

async function deploy() {
  console.log('🚀 Starting mainnet deployment...');
  
  for (const contract of contracts) {
    try {
      const path = contract === 'vault-trait' ? `contracts/traits/${contract}.clar` : `contracts/${contract}.clar`;
      const source = readFileSync(path, 'utf8');
      
      const tx = await makeContractDeploy({
        contractName: contract,
        codeBody: source,
        senderKey: mnemonic,
        network,
        anchorMode: AnchorMode.Any,
        fee: 500000
      });
      
      const result = await broadcastTransaction(tx, network);
      console.log(`✅ ${contract}: ${result.txid}`);
      
      await new Promise(r => setTimeout(r, 60000));
    } catch (e) {
      console.error(`❌ ${contract}:`, e.message);
    }
  }
}

deploy();