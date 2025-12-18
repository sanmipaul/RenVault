# RenVault Deployment Guide

## Contract Deployment Order

Deploy contracts in this specific order to handle dependencies:

### Batch 1: Traits and Interfaces
1. `sip009-nft-trait` - NFT standard interface
2. `vault-trait` - Vault interface definition

### Batch 2: Core Infrastructure  
3. `oracle` - Price feed system
4. `emergency` - Protocol safety controls

### Batch 3: Analytics and Governance
5. `analytics` - Usage tracking
6. `governance` - Parameter management

### Batch 4: Rewards System
7. `rewards` - Milestone rewards
8. `timelock` - Secure withdrawals

### Batch 5: Advanced Features
9. `nft-badges` - Achievement NFTs
10. `staking` - Point staking system

### Batch 6: User Features
11. `referral` - Referral bonuses
12. `vault-factory` - Vault creation

### Batch 7: Main Contract
13. `ren-vault` - Core vault functionality

## Deployment Commands

```bash
# Generate deployment plan
clarinet deployments generate --devnet

# Apply deployment
clarinet deployments apply --devnet

# Check deployment status
clarinet deployments check --devnet
```

## Post-Deployment Verification

After deployment, verify each contract is accessible and functional.