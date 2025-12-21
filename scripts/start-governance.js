// Governance System Startup Script
const { GovernanceAPI } = require('./governanceAPI');
const { TreasuryManager } = require('./treasuryManager');

async function startGovernance() {
  console.log('🏛️ Starting RenVault Governance System...\n');

  // Initialize treasury
  const treasury = new TreasuryManager();
  treasury.deposit(1000000, 'initial-funding');
  treasury.createBudget('development', 500000);
  treasury.createBudget('marketing', 200000);
  console.log('✅ Treasury initialized with budgets\n');

  // Start governance API
  const governanceAPI = new GovernanceAPI(3004);
  governanceAPI.start();
  console.log('✅ Governance API server started on http://localhost:3004\n');

  // Create sample proposal
  const proposalId = governanceAPI.proposals.createProposal(
    'SP1234...',
    'Protocol Fee Adjustment',
    'Proposal to reduce protocol fees from 1% to 0.5%',
    'parameter-change'
  );
  console.log(`✅ Sample proposal created (ID: ${proposalId})\n`);

  console.log('🏛️ Governance system is ready!');
  console.log('API: http://localhost:3004');
  console.log('Treasury Balance:', treasury.getBalance().toLocaleString(), 'STX');
}

if (require.main === module) {
  startGovernance().catch(console.error);
}

module.exports = { startGovernance };