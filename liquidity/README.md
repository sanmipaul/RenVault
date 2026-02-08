# Liquidity Pool Management System

Automated Market Maker (AMM) with liquidity provision, swaps, and rewards.

## Features

- **Pool Creation**: Create token pairs with initial liquidity
- **Swap Engine**: Token swaps with slippage protection
- **Liquidity Rewards**: APY-based rewards for liquidity providers
- **Impermanent Loss**: Calculate and track IL for positions
- **Pool Analytics**: Volume, fees, and performance metrics

## API Endpoints

### Pools
- `POST /pools` - Create new pool
- `GET /pools/:id` - Get pool details
- `GET /pools/:id/stats` - Get pool statistics

### Swaps
- `POST /pools/:id/swap` - Execute token swap

### Liquidity
- `POST /pools/:id/liquidity` - Add liquidity
- `GET /pools/:id/rewards/:user` - Get user rewards
- `POST /pools/:id/rewards/:user/claim` - Claim rewards

### Analytics
- `GET /pools/:id/impermanent-loss/:user` - Calculate IL

## Usage

```bash
npm install
npm start
```

Server runs on port 3011.
