# Referral System

## Overview
Comprehensive referral system for RenVault protocol with user incentives, commission tracking, and viral growth mechanics.

## Features
- **Referral Registration**: Users can refer others with unique codes
- **Reward System**: Bonuses for new users and commissions for referrers
- **Code Generation**: Automatic unique referral code creation
- **Analytics Tracking**: Comprehensive referral metrics and insights
- **Leaderboard**: Top referrers ranking system

## Reward Structure
- **New User Bonus**: 0.05 STX for joining with referral
- **Referrer Commission**: 5% of referred user's transactions
- **Maximum Commission**: 20% (configurable)

## Usage

### Start Referral System
```bash
node scripts/start-referral.js
```

### API Endpoints
- `POST /api/referral/register` - Register referral relationship
- `POST /api/referral/register-code` - Register using referral code
- `POST /api/referral/reward` - Process referral commission
- `POST /api/referral/claim` - Claim accumulated rewards
- `GET /api/referral/stats/:user` - User referral statistics
- `GET /api/referral/leaderboard` - Top referrers ranking
- `GET /api/referral/metrics` - System-wide metrics
- `GET /api/referral/validate/:code` - Validate referral code

## Referral Codes
- **Format**: 8-character alphanumeric codes
- **Generation**: Based on user address or random
- **Validation**: Automatic uniqueness checking
- **Sharing**: Built-in social media integration

## Analytics Features
- Total referrals and rewards tracking
- Conversion rate calculations
- Time-series data analysis
- Individual referrer performance
- Leaderboard rankings

## Social Sharing
- Direct referral links
- Twitter integration
- Telegram sharing
- WhatsApp sharing
- Email templates
- QR code generation