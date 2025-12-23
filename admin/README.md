# RenVault Admin Dashboard

Comprehensive admin dashboard for managing the RenVault ecosystem.

## Features

- **System Monitoring**: Real-time service health and metrics
- **Service Control**: Restart and manage all RenVault services
- **Authentication**: Secure JWT-based admin access
- **Real-time Updates**: Live metrics with Socket.IO
- **Centralized Management**: Single interface for entire system

## Quick Start

```bash
cd admin
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start admin dashboard
npm start
```

Access dashboard at `http://localhost:3005`

Default credentials: `admin` / `renvault2024`

## Components

- **server.js** - Express server with Socket.IO
- **controllers/systemController.js** - System operations
- **middleware/auth.js** - Authentication middleware
- **public/index.html** - Admin web interface

## API Endpoints

- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/status` - System status overview
- `GET /api/admin/metrics` - Aggregated protocol metrics
- `POST /api/admin/services/:service/restart` - Restart service

## Real-time Features

- Live metrics updates every 5 seconds
- Service restart notifications
- System health monitoring
- Activity logs display

## Security

- JWT token authentication
- Bcrypt password hashing
- Environment-based configuration
- Session timeout (24 hours)

## Monitored Services

- Frontend (React app)
- Mobile (React Native)
- Monitoring (Analytics)
- Leaderboard (Gamification)
- Notifications (Email/Push)
- Backup (Data protection)