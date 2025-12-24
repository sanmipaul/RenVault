# Oracle Price Feeds

## Overview
Decentralized oracle system for RenVault protocol with multi-source price aggregation, validation, and automated updates.

## Features
- **Multi-Source Aggregation**: Coinbase, Binance, CoinGecko integration
- **Price Validation**: Data integrity checks and anomaly detection
- **Automated Updates**: Configurable update intervals
- **Weighted Averaging**: Source reliability weighting
- **Staleness Protection**: Automatic stale data detection

## Supported Assets
- **STX/USD**: Stacks token price
- **BTC/USD**: Bitcoin price reference
- **ETH/USD**: Ethereum price reference

## Usage

### Start Oracle System
```bash
node scripts/start-oracle.js
```

### API Endpoints
- `GET /api/oracle/prices` - All current prices
- `GET /api/oracle/price/:symbol` - Specific asset price
- `POST /api/oracle/update` - Force price update
- `GET /api/oracle/status` - System status
- `POST /api/oracle/start` - Start price updates
- `POST /api/oracle/stop` - Stop price updates
- `GET /api/oracle/health` - Health check

## Price Validation
- **Source Count**: Minimum 2 sources required
- **Deviation Check**: Max 10% deviation from average
- **Price Change**: Max 20% change between updates
- **Staleness**: Max 5 minutes age

## Data Sources
- **Coinbase**: Weight 3, Primary source
- **Binance**: Weight 2, Secondary source
- **CoinGecko**: Weight 1, Backup source

## Contract Integration
- Authorized operator system
- Staleness threshold configuration
- Multi-asset price storage
- Historical price tracking