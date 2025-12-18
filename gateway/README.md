# RenVault API Gateway

Centralized API gateway and microservices orchestration for RenVault ecosystem.

## Features

- **Service Routing**: Centralized routing to all microservices
- **Load Balancing**: Round-robin load balancing for service instances
- **Rate Limiting**: Request throttling and abuse prevention
- **Caching**: In-memory caching with TTL support
- **Security**: CORS, Helmet, and request validation
- **Data Aggregation**: Combined data from multiple services

## Quick Start

```bash
cd gateway
npm install
npm start
```

Gateway runs on `http://localhost:8080`

## API Routes

### Service Proxies
- `GET /api/monitoring/*` - Monitoring service
- `GET /api/leaderboard/*` - Leaderboard service
- `GET /api/notifications/*` - Notification service
- `GET /api/backup/*` - Backup service
- `GET /api/admin/*` - Admin dashboard

### Aggregated Endpoints
- `GET /api/aggregate/dashboard` - Combined dashboard data
- `GET /api/aggregate/overview` - System overview

### System
- `GET /health` - Gateway health check

## Configuration

Edit `config/services.json` to modify:
- Service endpoints and timeouts
- Rate limiting settings
- Gateway port configuration

## Architecture

```
Client → API Gateway → Microservices
         ↓
    Load Balancer
         ↓
    Cache Layer
         ↓
    Service Instances
```