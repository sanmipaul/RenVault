# Manual Mainnet Deployment

## Contract Deployment Order

Deploy these contracts in order on Stacks mainnet:

### 1. sip009-nft-trait
```clarity
;; Copy contents from contracts/sip009-nft-trait.clar
```

### 2. vault-trait  
```clarity
;; Copy contents from contracts/traits/vault-trait.clar
```

### 3. oracle
```clarity
;; Copy contents from contracts/oracle.clar
```

### 4. emergency
```clarity
;; Copy contents from contracts/emergency.clar
```

### 5. analytics
```clarity
;; Copy contents from contracts/analytics.clar
```

### 6. governance
```clarity
;; Copy contents from contracts/governance.clar
```

### 7. rewards
```clarity
;; Copy contents from contracts/rewards.clar
```

### 8. timelock
```clarity
;; Copy contents from contracts/timelock.clar
```

### 9. nft-badges
```clarity
;; Copy contents from contracts/nft-badges.clar
```

### 10. staking
```clarity
;; Copy contents from contracts/staking.clar
```

### 11. referral
```clarity
;; Copy contents from contracts/referral.clar
```

### 12. vault-factory
```clarity
;; Copy contents from contracts/vault-factory.clar
```

### 13. ren-vault
```clarity
;; Copy contents from contracts/ren-vault.clar
```

## Deployment Instructions

1. Go to https://explorer.stacks.co/sandbox/deploy
2. Connect your wallet with the mnemonic
3. Deploy each contract in the order above
4. Wait for confirmation before deploying next contract
5. Set fee to 0.5 STX per contract