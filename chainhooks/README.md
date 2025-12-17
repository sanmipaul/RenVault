# RenVault Chainhooks Integration

Real-time blockchain event monitoring using Hiro Chainhooks for RenVault contract events.

## Features

- **Real-time Monitoring**: Instant notifications for deposits and withdrawals
- **Webhook Processing**: Secure webhook endpoints for event handling
- **Event Integration**: Automatic updates to monitoring and notification systems
- **CLI Management**: Start/stop monitoring with command-line interface

## Quick Start

```bash
cd chainhooks
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start webhook server
npm start

# Start monitoring (in another terminal)
npm run monitor
```

## Components

- **client.js** - Chainhooks client for hook management
- **webhookServer.js** - Express server for webhook endpoints
- **monitor.js** - CLI orchestrator for monitoring control

## Usage

### Start Monitoring
```bash
node monitor.js start
```

### Check Status
```bash
node monitor.js status
```

### Stop Monitoring
```bash
node monitor.js stop
```

## Webhook Endpoints

- `POST /webhooks/deposit` - RenVault deposit events
- `POST /webhooks/withdraw` - RenVault withdrawal events

## Event Processing

When events are received:
1. Authentication verification
2. Event data extraction
3. Monitoring system updates
4. User statistics updates
5. Notification triggers

## Configuration

- **CHAINHOOKS_URL**: Chainhooks server endpoint
- **WEBHOOK_SECRET**: Authentication token for webhooks
- **CONTRACT_ADDRESS**: RenVault contract address
- **PORT**: Webhook server port