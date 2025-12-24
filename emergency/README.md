# Emergency Pause System

## Overview
Comprehensive emergency pause system for RenVault protocol with threat detection, circuit breakers, and automated protection mechanisms.

## Features
- **Emergency Pause**: Manual protocol pause by authorized contacts
- **Threat Detection**: Automated monitoring with configurable thresholds
- **Circuit Breakers**: Automatic protection for critical operations
- **Alert System**: Real-time threat alerts and notifications
- **Access Control**: Multi-signature emergency contact system

## Emergency Triggers
- **High Withdrawal Rate**: >10% of total funds in 1 hour
- **Failed Transactions**: >50 failed transactions
- **High Slippage**: >5% price slippage
- **Manual Trigger**: Emergency contact activation

## Usage

### Start Emergency System
```bash
node scripts/start-emergency.js
```

### API Endpoints
- `GET /api/emergency/status` - Current pause status
- `POST /api/emergency/pause` - Trigger emergency pause
- `POST /api/emergency/resume` - Resume operations
- `POST /api/emergency/check` - Check threat levels
- `GET /api/emergency/history` - Pause history
- `GET /api/emergency/contacts` - Emergency contacts
- `GET /api/emergency/alerts` - Alert history

## Circuit Breaker States
- **CLOSED**: Normal operations
- **OPEN**: Operations blocked
- **HALF_OPEN**: Testing recovery

## Security Features
- Multi-signature emergency contacts
- Automated threat detection
- Circuit breaker protection
- Pause history logging
- Real-time monitoring