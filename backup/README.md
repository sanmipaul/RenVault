# RenVault Backup & Recovery System

Automated backup and recovery system for RenVault protocol data.

## Features

- **Data Export**: Export user balances and commitment points
- **Automated Backups**: Scheduled backup creation
- **Recovery Management**: Backup validation and recovery planning
- **API Interface**: REST endpoints for backup operations
- **File Storage**: JSON-based backup storage

## Quick Start

```bash
cd backup
npm install

# Create manual backup
npm run backup

# Start API server
npm start

# Start scheduler
npm run scheduler
```

## Components

- **dataExporter.js** - Export user data from blockchain
- **recoveryManager.js** - Backup validation and recovery
- **scheduler.js** - Automated backup scheduling
- **api.js** - REST API server
- **scripts/** - Command-line utilities

## API Endpoints

- `POST /api/backup/create` - Create new backup
- `GET /api/backup/list` - List all backups
- `GET /api/backup/report/:filename` - Generate recovery report
- `POST /api/backup/schedule/start` - Start scheduler
- `POST /api/backup/schedule/stop` - Stop scheduler
- `GET /api/backup/schedule/status` - Scheduler status

## Backup Format

```json
{
  "exportedAt": "2024-01-15T10:30:00.000Z",
  "totalUsers": 100,
  "users": [
    {
      "address": "SP1ABC...",
      "balance": "1000000",
      "points": "5",
      "exportedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

## Recovery Process

1. List available backups
2. Generate recovery report
3. Validate backup data
4. Create recovery plan
5. Execute recovery if needed