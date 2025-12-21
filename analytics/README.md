# Analytics Dashboard

## Overview
Advanced analytics dashboard for RenVault protocol with real-time metrics tracking, data visualization, and user behavior analysis.

## Features
- **Metrics Collection**: Track deposits, withdrawals, users, and fees
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
- `GET /api/timeseries?interval=daily` - Time series data
- `POST /api/deposit` - Record deposit event
- `POST /api/withdrawal` - Record withdrawal event

## Components
- **MetricsCollector**: Core metrics aggregation
- **DashboardServer**: Express API server
- **DataProcessor**: Event processing pipeline
- **AnalyticsUpdater**: Real-time WebSocket updates
- **Analytics Contract**: On-chain data storage