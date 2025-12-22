# NFT Rewards System

## Overview
NFT-based achievement system for RenVault protocol with automated badge minting, rarity tiers, and SIP009 compliance.

## Features
- **Achievement Tracking**: Automated milestone detection
- **NFT Minting**: SIP009-compliant badge creation
- **Rarity System**: Common, Rare, Epic, Legendary tiers
- **Badge Generation**: Dynamic SVG artwork creation
- **Metadata Standards**: Full OpenSea compatibility

## Achievements
- **First Steps**: Make your first deposit (Common, 10 pts)
- **Whale Status**: Deposit over 100 STX (Rare, 100 pts)
- **Diamond Hands**: Reach 100 commitment points (Epic, 250 pts)
- **Early Adopter**: Join first 1000 users (Legendary, 500 pts)

## Usage

### Start NFT System
```bash
node scripts/start-nft-rewards.js
```

### API Endpoints
- `GET /api/achievements` - All achievements with stats
- `GET /api/achievements/:user` - User achievements and NFTs
- `POST /api/track-activity` - Track user activity
- `GET /api/nft/:tokenId` - NFT metadata
- `POST /api/nft/transfer` - Transfer NFT
- `GET /api/stats` - System statistics

## Rarity Distribution
- **Common**: 60% (Green badges)
- **Rare**: 25% (Blue badges)
- **Epic**: 12% (Purple badges)
- **Legendary**: 3% (Orange badges)

## Technical Features
- SIP009 NFT standard compliance
- Animated SVG badge generation
- Automatic achievement detection
- Metadata IPFS integration
- Transfer functionality