# Automated Yield Strategies

## Overview
Automated yield farming and staking strategies for RenVault protocol with portfolio optimization, auto-compounding, and risk management.

## Features
- **Multiple Strategies**: Staking, liquidity provision, lending
- **Portfolio Optimization**: Risk-based allocation recommendations
- **Auto-Compounding**: Automated reward reinvestment
- **Strategy Execution**: Automated strategy deployment
- **Rebalancing**: Dynamic portfolio optimization

## Yield Strategies
- **Staking**: 5% APY, Low risk
- **Liquidity**: 8% APY, Medium risk  
- **Lending**: 3% APY, Very low risk

## Usage

### Start Yield System
```bash
node scripts/start-yield.js
```

### API Endpoints
- `GET /api/strategies` - Available strategies
- `POST /api/yield/stake` - Execute strategy
- `GET /api/yield/optimize/:user` - Get optimal allocation
- `POST /api/yield/rebalance` - Rebalance portfolio
- `GET /api/yield/portfolio/:user` - User portfolio

## Auto-Compounding
- Automatic reward reinvestment
- Configurable frequency (default: 24h)
- 1% compounding bonus
- User-controlled enable/disable

## Risk Management
- **Low Risk**: 70% staking, 20% liquidity, 10% lending
- **Medium Risk**: 50% staking, 40% liquidity, 10% lending
- **High Risk**: 30% staking, 60% liquidity, 10% lending