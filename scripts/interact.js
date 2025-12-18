const { StacksMainnet } = require('@stacks/network');
const { 
  callReadOnlyFunction,
  standardPrincipalCV
} = require('@stacks/transactions');

const network = new StacksMainnet();
const contractAddress = 'SP3ESR2PWP83R1YM3S4QJRWPDD886KJ4YFS3FKHPY';
const contractName = 'ren-vault';

async function getUserBalance(userAddress) {
  const result = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-balance',
    functionArgs: [standardPrincipalCV(userAddress)],
    network,
  });
  return result.value;
}

async function getUserPoints(userAddress) {
  const result = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-points',
    functionArgs: [standardPrincipalCV(userAddress)],
    network,
  });
  return result.value;
}

module.exports = { getUserBalance, getUserPoints };