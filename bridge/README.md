# Cross-Chain Bridge

## Overview
Cross-chain bridge integration for RenVault protocol enabling multi-blockchain asset management with secure validator network and automated bridging.

## Features
- **Multi-Chain Support**: Ethereum, Bitcoin integration
- **Validator Network**: Decentralized bridge security
- **Asset Locking**: Secure cross-chain asset transfers
- **Chain Adapters**: Modular blockchain integration
- **API Server**: RESTful bridge operations

## Supported Chains
- **Stacks**: Native STX and SIP-010 tokens
- **Ethereum**: ETH and ERC-20 tokens
- **Bitcoin**: BTC transfers

## Usage

### Start Bridge
```bash
node scripts/start-bridge.js
```

### API Endpoints
- `GET /api/chains` - Supported blockchains
- `POST /api/bridge/initiate` - Start bridge transfer
- `POST /api/bridge/lock` - Lock assets for transfer
- `GET /api/bridge/status/:txId` - Transaction status
- `GET /api/validators` - Active validators

## Bridge Process
1. **Initiate**: User requests cross-chain transfer
2. **Lock**: Assets locked on source chain
3. **Validate**: Validator network confirms transaction
4. **Release**: Assets released on target chain

## Security
- Multi-signature validation required
- Validator staking mechanism
- Emergency pause functionality
- Transaction monitoring