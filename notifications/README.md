# RenVault Notification System

Multi-channel notification system for RenVault protocol events with comprehensive wallet security and transaction monitoring.

## Features

- **Transaction Notifications**: Deposit, withdrawal, staking rewards, liquidity rewards
- **Security Alerts**: Failed login attempts, suspicious activity, 2FA changes
- **Email Notifications**: SMTP-based email alerts with HTML templates
- **Push Notifications**: Web push notifications with VAPID keys
- **Customizable Preferences**: Granular control over notification types
- **Real-time Updates**: WebSocket integration for instant notifications
- **User Preferences**: Configurable notification settings per user

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

## Notification Types

### Transaction Notifications
- **Deposit Confirmations**: Notify when STX deposits are confirmed
- **Withdrawal Confirmations**: Alert on successful withdrawals
- **Staking Rewards**: Notify when staking rewards are earned
- **Liquidity Rewards**: Alert for liquidity pool rewards

### Security Alerts
- **Failed Login Attempts**: IP address and user agent tracking
- **Suspicious Activity**: Unusual account behavior detection
- **2FA Changes**: Enable/disable two-factor authentication alerts
- **Session Security**: Account access and logout notifications

## Components

- **emailService.js** - SMTP email notifications with security templates
- **pushService.js** - Web push notifications with subscription management
- **notificationManager.js** - Unified notification orchestrator with preferences
- **api.js** - REST API server with comprehensive endpoints
- **templates/** - HTML email templates for different notification types

## API Endpoints

### Preferences Management
- `POST /api/notifications/preferences` - Set user notification preferences
- `POST /api/notifications/subscribe-push` - Subscribe to push notifications
- `DELETE /api/notifications/unsubscribe-push/:userId` - Unsubscribe from push

### Transaction Notifications
- `POST /api/notifications/test-deposit` - Test deposit notification
- `POST /api/notifications/test-withdrawal` - Test withdrawal notification
- `POST /api/notifications/test-staking-reward` - Test staking reward notification
- `POST /api/notifications/test-liquidity-reward` - Test liquidity reward notification

### Security Notifications
- `POST /api/notifications/test-failed-login` - Test failed login alert
- `POST /api/notifications/test-suspicious-activity` - Test suspicious activity alert
- `POST /api/notifications/test-2fa-enabled` - Test 2FA enabled notification
- `POST /api/notifications/test-2fa-disabled` - Test 2FA disabled notification

### Analytics
- `GET /api/notifications/stats` - System statistics and metrics

## Configuration

### Email Setup
1. Get SMTP credentials (Gmail, SendGrid, etc.)
2. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env
3. Configure FROM_EMAIL address

### Push Notifications
1. Generate VAPID keys: `npx web-push generate-vapid-keys`
2. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env
3. Configure push notification permissions in frontend

### User Preferences Structure
```json
{
  "email": "user@example.com",
  "emailEnabled": true,
  "pushEnabled": true,
  "depositNotifications": true,
  "withdrawalNotifications": true,
  "stakingNotifications": true,
  "rewardNotifications": true,
  "securityAlerts": true,
  "loginAlerts": true,
  "suspiciousActivityAlerts": true,
  "twoFactorAlerts": true
}
```

## Frontend Integration

### Notification Center Component
- Real-time notification display
- Categorization (All, Unread, Transaction, Security, Rewards)
- Mark as read functionality
- Notification preferences management

### Notification Preferences
- Granular control over notification types
- Email and push notification settings
- Security alert configuration
- Real-time preference updates

## Security Features

- **Rate Limiting**: Protection against notification spam
- **Input Validation**: Sanitized notification content
- **User Authentication**: Secure preference management
- **Privacy Protection**: Opt-in notification system
- **Audit Logging**: Notification delivery tracking
2. Set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY in .env
3. Configure VAPID_SUBJECT with contact email

## Notification Types

- **Deposit Alerts**: Confirmation emails and push notifications
- **Withdrawal Alerts**: Transaction completion notifications
- **Leaderboard Updates**: Ranking change notifications
- **System Alerts**: Protocol status updates