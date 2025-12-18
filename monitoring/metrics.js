const { StacksMainnet } = require('@stacks/network');
const { callReadOnlyFunction, standardPrincipalCV } = require('@stacks/transactions');

const network = new StacksMainnet();
const CONTRACT_ADDRESS = 'SP3ESR2PWP83R1YM3S4QJRWPDD886KJ4YFS3FKHPY';
const CONTRACT_NAME = 'ren-vault';

async function getProtocolMetrics() {
  try {
    const feesResult = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-fees-collected',
      functionArgs: [],
      network,
    });

    return {
      totalFees: feesResult.value,
      timestamp: Date.now(),
      network: 'mainnet'
    };
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return null;
  }
}

async function getUserMetrics(userAddress) {
  try {
    const balanceResult = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-balance',
      functionArgs: [standardPrincipalCV(userAddress)],
      network,
    });

    const pointsResult = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-points',
      functionArgs: [standardPrincipalCV(userAddress)],
      network,
    });

    return {
      address: userAddress,
      balance: balanceResult.value,
      points: pointsResult.value,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    return null;
  }
}

module.exports = { getProtocolMetrics, getUserMetrics };