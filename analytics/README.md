# Analytics Dashboard

## Overview
Advanced analytics dashboard for RenVault protocol with real-time metrics tracking, data visualization, and user behavior analysis.

## Features
- **Metrics Collection**: Track deposits, withdrawals, users, and fees
- **Wallet Analytics**: Monitor connection methods, success rates, and errors
- **Performance Metrics**: Track operation durations and system performance
- **Privacy-Respecting**: Opt-out functionality and aggregated data only
- **Real-time Updates**: WebSocket-based live data streaming
- **Data Visualization**: Interactive charts and graphs
- **On-chain Analytics**: Clarity contract for blockchain data
- **Time Series Analysis**: Daily/hourly data aggregation

## Usage

### Start Dashboard
```bash
node scripts/start-analytics.js
```

### Access Dashboard
- Web UI: http://localhost:3001
- WebSocket: ws://localhost:8080
- API: http://localhost:3001/api/stats

## API Endpoints
- `GET /api/stats` - Current protocol statistics
- `GET /api/wallet-stats` - Wallet connection analytics
- `GET /api/timeseries?interval=daily` - Time series data
- `POST /api/deposit` - Record deposit event
- `POST /api/withdrawal` - Record withdrawal event
- `POST /api/wallet-connect` - Record wallet connection
- `POST /api/wallet-error` - Record wallet error
- `POST /api/performance` - Record performance metric

## Components
- **MetricsCollector**: Core metrics aggregation
- **DashboardServer**: Express API server
- **DataProcessor**: Event processing pipeline
- **AnalyticsUpdater**: Real-time WebSocket updates
- **Analytics Component**: Frontend dashboard with opt-out
- **Analytics Contract**: On-chain data storage