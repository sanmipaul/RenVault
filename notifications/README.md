# RenVault Notification System

Multi-channel notification system for RenVault protocol events.

## Features

- **Email Notifications**: SMTP-based email alerts
- **Push Notifications**: Web push notifications
- **User Preferences**: Configurable notification settings
- **Template System**: HTML email templates
- **Multi-channel**: Email + Push coordination

## Quick Start

```bash
cd notifications
npm install

# Configure environment
cp .env.example .env
# Edit .env with your SMTP and VAPID settings

# Start notification server
npm start
```

## Components

- **emailService.js** - SMTP email notifications
- **pushService.js** - Web push notifications
- **notificationManager.js** - Unified notification orchestrator
- **api.js** - REST API server
- **templates/** - HTML email templates

## API Endpoints

- `POST /api/notifications/preferences` - Set user preferences
- `POST /api/notifications/subscribe-push` - Subscribe to push
- `DELETE /api/notifications/unsubscribe-push/:userId` - Unsubscribe
- `GET /api/notifications/stats` - System statistics

## Configuration

### Email Setup
1. Get SMTP credentials (Gmail, SendGrid, etc.)
2. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env
3. Configure FROM_EMAIL address

### Push Notifications
1. Generate VAPID keys: `npx web-push generate-vapid-keys`
2. Set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY in .env
3. Configure VAPID_SUBJECT with contact email

## Notification Types

- **Deposit Alerts**: Confirmation emails and push notifications
- **Withdrawal Alerts**: Transaction completion notifications
- **Leaderboard Updates**: Ranking change notifications
- **System Alerts**: Protocol status updates