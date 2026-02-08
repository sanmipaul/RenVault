# Liquidity Pool API Documentation

## Base URL
`http://localhost:3011`

## Endpoints

### Create Pool
**POST** `/pools`

Create a new liquidity pool.

**Request Body:**
```json
{
  "tokenA": "STX",
  "tokenB": "USDC",
  "reserveA": 100000,
  "reserveB": 50000
}
```

**Response:**
```json
{
  "poolId": "STX-USDC",
  "success": true
}
```

### Execute Swap
**POST** `/pools/:id/swap`

Execute a token swap.

**Request Body:**
```json
{
  "tokenIn": "STX",
  "amountIn": 1000,
  "minAmountOut": 400
}
```

**Response:**
```json
{
  "success": true,
  "amountOut": 495.02,
  "fee": 3.0
}
```

### Add Liquidity
**POST** `/pools/:id/liquidity`

Add liquidity to a pool.

**Request Body:**
```json
{
  "user": "SP2...",
  "amount": 10000
}
```

### Get Rewards
**GET** `/pools/:id/rewards/:user`

Get user's pending rewards.

**Response:**
```json
{
  "rewards": 125.50
}
```

### Claim Rewards
**POST** `/pools/:id/rewards/:user/claim`

Claim pending rewards.

**Response:**
```json
{
  "claimed": 125.50
}
```

### Get Pool Stats
**GET** `/pools/:id/stats`

Get pool statistics.

**Response:**
```json
{
  "totalLiquidity": 500000,
  "apy": 5.0,
  "dailyRewards": 68.49
}
```

### Record Position
**POST** `/pools/:id/position`

Record LP position for IL tracking.

**Request Body:**
```json
{
  "user": "SP2...",
  "tokenA": "STX",
  "tokenB": "USDC",
  "amountA": 10000,
  "amountB": 5000,
  "priceA": 1.0,
  "priceB": 1.0
}
```

### Get Impermanent Loss
**GET** `/pools/:id/impermanent-loss/:user?priceA=1.2&priceB=1.0`

Calculate impermanent loss.

**Response:**
```json
{
  "impermanentLoss": 2.5,
  "lpValue": 14750,
  "holdValue": 15000,
  "priceRatio": 1.2,
  "isLoss": true
}
```
