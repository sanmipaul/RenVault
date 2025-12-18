# RenVault Mainnet Deployment

## Prerequisites
- Set `MAINNET_PRIVATE_KEY` environment variable
- Ensure sufficient STX balance for deployment fees (~6.5 STX total)
- Install dependencies: `npm install`

## Deployment Command
```bash
MAINNET_PRIVATE_KEY=your_key_here node scripts/deploy-mainnet.js
```

## Contract Deployment Order
1. sip009-nft-trait
2. vault-trait  
3. oracle
4. emergency
5. analytics
6. governance
7. rewards
8. timelock
9. nft-badges
10. staking
11. referral
12. vault-factory
13. ren-vault

## Expected Costs
- Each contract: ~500,000 microSTX (0.5 STX)
- Total: ~6.5 STX for all 13 contracts
- Deployment time: ~13 minutes (60s between contracts)

## Post-Deployment
Contracts will be available at:
`{deployer-address}.{contract-name}`