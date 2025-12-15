# RenVault Monitoring & Analytics

Real-time monitoring and analytics for the RenVault protocol.

## Features

- **Real-time Metrics**: Protocol fees, user balances, commitment points
- **Analytics Dashboard**: Web interface for visualizing data
- **Alert System**: Configurable thresholds and notifications
- **Historical Logging**: Time-series data storage and retrieval
- **REST API**: Programmatic access to metrics

## Quick Start

```bash
cd monitoring
npm install

# Start monitoring
npm start

# Start dashboard API
npm run api
```

## Components

- **metrics.js** - Data collection from Stacks blockchain
- **monitor.js** - Continuous monitoring orchestrator
- **dashboard.html** - Web analytics interface
- **api.js** - REST API server
- **logger.js** - Metrics logging utility
- **alerts.js** - Alert system for anomalies

## API Endpoints

- `GET /api/metrics` - Current protocol metrics
- `GET /api/user/:address` - User-specific metrics
- `GET /api/logs?hours=24` - Historical logs

## Configuration

Edit thresholds in `alerts.js`:
- `maxFees`: Maximum fee accumulation threshold
- `maxUsers`: Maximum user count threshold
- `errorRate`: Maximum error rate threshold