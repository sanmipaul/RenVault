# Multi-Asset Vault Support

## Overview
Extends RenVault to support multiple asset types beyond STX, including SIP-010 fungible tokens.

## Features
- STX native asset support
- SIP-010 token integration
- Asset registry management
- Multi-asset vault operations
- Validation utilities

## Supported Assets
- **STX**: Native Stacks token
- **USDA**: Stablecoin (SIP-010)
- **ALEX**: Alex Protocol token (SIP-010)

## Usage
```javascript
const { VaultManager } = require('./vaultManager');
const vault = new VaultManager(stacksApi);

// Deposit STX
await vault.depositAsset('STX', 1000000, senderKey);

// Deposit SIP-010 token
await vault.depositAsset('USDA', 500000, senderKey);

// Check balance
const balance = await vault.getBalance(userAddress, 'STX');
```

## Architecture
- `multi-asset-vault.clar`: Main vault contract
- `asset-manager.clar`: SIP-010 token handler
- `sip010-trait.clar`: Token interface
- `assetRegistry.js`: Asset configuration
- `vaultManager.js`: JavaScript interface