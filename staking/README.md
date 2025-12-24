# Staking Rewards System

## Overview
Comprehensive staking rewards system for RenVault protocol with automated distribution, yield calculations, and flexible reward structures.

## Features
- **STX Staking**: Stake STX tokens to earn rewards
- **Automated Rewards**: Daily automated reward distribution
- **Yield Calculations**: Advanced APY and compound interest calculations
- **Lock Periods**: Configurable staking lock periods
- **Leaderboard**: Top stakers ranking system

## Staking Parameters
- **Reward Rate**: 1% per epoch (configurable)
- **Minimum Stake**: 1 STX (configurable)
- **Lock Period**: 24 hours
- **Distribution**: Daily automated payouts

## Usage

### Start Staking System
```bash
node scripts/start-staking.js
```

### API Endpoints
- `POST /api/staking/stake` - Stake STX tokens
- `POST /api/staking/unstake` - Unstake STX tokens
- `POST /api/staking/claim` - Claim pending rewards
- `GET /api/staking/info/:user` - User staking information
- `GET /api/staking/stats` - Global staking statistics
- `GET /api/staking/leaderboard` - Top stakers ranking
- `GET /api/staking/rewards/history` - Reward distribution history
- `GET /api/staking/rewards/stats` - Distribution statistics

## Yield Calculations
- **Simple Interest**: Linear reward calculation
- **Compound Interest**: Reinvested rewards compounding
- **APY Calculation**: Annual percentage yield
- **Break-even Analysis**: Cost vs reward analysis
- **Risk-adjusted Returns**: Risk factor considerations

## Reward Distribution
- **Automated**: Daily distribution to all stakers
- **Proportional**: Rewards based on stake amount and duration
- **Compound Option**: Automatic reward reinvestment
- **History Tracking**: Complete distribution audit trail

## Security Features
- Lock period enforcement
- Minimum stake requirements
- Automated reward calculations
- Transparent distribution history
- Owner-controlled parameters