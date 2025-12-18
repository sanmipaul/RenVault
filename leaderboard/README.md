# RenVault Leaderboard & Gamification

Competitive leaderboard and achievement system for RenVault users.

## Features

- **User Rankings**: Score-based leaderboard system
- **Badge System**: Achievement badges for milestones
- **Reward Tiers**: Multipliers and bonuses for top performers
- **Real-time Updates**: Automated data synchronization
- **Web Interface**: Interactive leaderboard display

## Quick Start

```bash
cd leaderboard
npm install

# Start API server
npm start

# Start scheduler
npm run scheduler
```

## Components

- **rankings.js** - Core leaderboard logic
- **badges.js** - Achievement system
- **rewards.js** - Reward calculation
- **scheduler.js** - Automated updates
- **api.js** - REST API endpoints
- **leaderboard.html** - Web interface

## API Endpoints

- `GET /api/leaderboard?limit=10` - Top users
- `GET /api/user/:address/rank` - User rank and badges
- `POST /api/update/:address` - Manual user update

## Scoring System

Score = (Balance in STX) + (Commitment Points × 10)

## Badge Requirements

- 🏆 First Saver: 1+ commitment points
- 💎 High Roller: 100+ STX deposited
- 👑 Commitment King: 50+ commitment points
- 🐋 Whale: 1000+ STX balance