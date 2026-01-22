# RenVault Web3-Native Notification System

Advanced multi-channel notification system with Web3-native capabilities for the RenVault protocol, powered by Reown AppKit.

## 🚀 Features

### Core Features
- **Web3-Native Notifications**: Real-time on-chain event notifications via AppKit
- **Email Notifications**: SMTP-based email alerts with HTML templates
- **Push Notifications**: Browser push notifications with VAPID
- **In-App Notifications**: Real-time notification center
- **Blockchain Event Listening**: Automatic detection of on-chain events

### Notification Types
- **Transaction Events**: Deposit/withdrawal confirmations
- **Vault Events**: Creation, updates, rewards, maturity alerts
- **Account Events**: Security alerts, multi-sig requests, session warnings
- **Market Events**: Price alerts and yield changes
- **User Preferences**: Granular control over notification channels and types

### Advanced Features
- **Real-time Updates**: WebSocket-based real-time notifications
- **Event Filtering**: Smart filtering based on user preferences
- **Rate Limiting**: Prevents notification spam
- **Offline Queuing**: Notifications delivered when back online
- **Cross-device Sync**: Consistent notifications across devices

## 🏗️ Architecture

```
Blockchain Events → Event Listener → Notification Service → AppKit → User
                                           ↓
                                    Notification DB
                                           ↓
                                    Analytics Service
```

## 📋 Quick Start

### Backend Setup
```bash
cd notifications
npm install

# Configure environment
cp .env.example .env
# Edit .env with your SMTP, VAPID, and Web3 settings

# Start notification server
npm start
```

### Frontend Integration
```typescript
import { notificationService } from './services/notification-service';

// Initialize notifications
await notificationService.requestNotificationPermission();

// Set user preferences
notificationService.setUserPreferences(userId, {
  emailEnabled: true,
  pushEnabled: true,
  web3Enabled: true,
  eventTypes: {
    deposits: true,
    withdrawals: true,
    vaultCreated: true,
    // ... more preferences
  }
});
```

## 🔧 Components

### Backend
- **api.js** - REST API server with comprehensive endpoints
- **notificationManager.js** - Unified notification orchestrator
- **emailService.js** - SMTP email service with templates
- **pushService.js** - Web push notification service
- **blockchainEventListener.js** - On-chain event monitoring

### Frontend
- **notification-service.ts** - Web3-native notification service
- **NotificationCenter.tsx** - In-app notification UI
- **NotificationPreferences.tsx** - User preference management
- **notifications.css** - Comprehensive styling

## 🌐 API Endpoints

### User Preferences
- `POST /api/notifications/preferences` - Set user preferences
- `GET /api/notifications/preferences/:userId` - Get user preferences

### Push Notifications
- `POST /api/notifications/subscribe-push` - Subscribe to push
- `DELETE /api/notifications/unsubscribe-push/:userId` - Unsubscribe

### Blockchain Events
- `POST /api/notifications/start-blockchain-listener` - Start event listener
- `POST /api/notifications/stop-blockchain-listener` - Stop event listener
- `POST /api/notifications/simulate/*` - Simulate blockchain events

### Testing
- `POST /api/notifications/test-*` - Test various notification types
- `GET /api/notifications/stats` - System statistics

## ⚙️ Configuration

### Environment Variables
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@renvault.com

# Push Notification VAPID Keys
VAPID_SUBJECT=mailto:admin@renvault.com
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key

# Web3 Configuration
WALLETCONNECT_PROJECT_ID=your-project-id
BLOCKCHAIN_RPC_URL=https://stacks-node-api.mainnet.stacks.co

# Database (Optional)
REDIS_URL=redis://localhost:6379
POSTGRES_URL=postgresql://user:pass@localhost:5432/notifications
```

### Email Setup
1. Choose email provider (Gmail, SendGrid, AWS SES, etc.)
2. Configure SMTP credentials in `.env`
3. Customize email templates in `templates/` directory

### Push Notifications
1. Generate VAPID keys: `npx web-push generate-vapid-keys`
2. Add keys to `.env`
3. Configure service worker for push handling

### Web3 Integration
1. Get WalletConnect Project ID from Reown Cloud
2. Configure AppKit metadata
3. Set up notification permissions in wallet

## 📱 Frontend Usage

### Notification Center
```tsx
import { NotificationCenter } from './components/NotificationCenter';

function App() {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <button onClick={() => setShowNotifications(true)}>
        Notifications ({unreadCount})
      </button>

      <NotificationCenter
        userId={currentUser.id}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}
```

### Notification Preferences
```tsx
import { NotificationPreferencesComponent } from './components/NotificationPreferences';

<NotificationPreferencesComponent
  userId={currentUser.id}
  onClose={() => setShowPreferences(false)}
/>
```

## 🔗 Integration Points

### Existing Systems
- **Session Management**: Notify on session events
- **Transaction Monitoring**: Real-time transaction alerts
- **Vault Operations**: Vault lifecycle notifications
- **Multi-signature**: Approval workflow notifications
- **2FA System**: Security event notifications

### Smart Contracts
- Event emission for vault operations
- Indexed event parameters for efficient filtering
- Standardized event schemas

## 📊 Monitoring & Analytics

### Metrics Tracked
- Notification delivery time
- Read/unread rates
- User engagement per notification type
- Opt-in/opt-out rates
- Channel preference distribution

### Performance
- Rate limiting to prevent spam
- Batching for efficiency
- Offline queuing
- Cross-device synchronization

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### API Testing
```bash
# Test deposit notification
curl -X POST http://localhost:3003/api/notifications/test-deposit \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "amount": "100 STX", "balance": "500 STX"}'
```

### Blockchain Event Simulation
```bash
# Simulate vault creation
curl -X POST http://localhost:3003/api/notifications/simulate/vault-created \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "vaultId": "vault_001", "vaultType": "yield"}'
```

## 🚀 Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3003
CMD ["npm", "start"]
```

### Kubernetes
See `deployment/kubernetes/` for K8s manifests.

### Environment-Specific Configs
- Development: `.env.development`
- Staging: `.env.staging`
- Production: `.env.production`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
2. Set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY in .env
3. Configure VAPID_SUBJECT with contact email

## Notification Types

- **Deposit Alerts**: Confirmation emails and push notifications
- **Withdrawal Alerts**: Transaction completion notifications
- **Leaderboard Updates**: Ranking change notifications
- **System Alerts**: Protocol status updates