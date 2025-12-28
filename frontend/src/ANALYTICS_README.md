# RenVault Analytics Documentation

## Overview

RenVault's analytics system provides comprehensive tracking of user behavior, transactions, performance metrics, and errors. The system is built on a modular architecture with privacy and GDPR compliance at its core.

### Key Features

- **Event Tracking**: Track wallet connections, transactions, and user interactions
- **Error Analytics**: Automatic error categorization and reporting
- **Funnel Analysis**: Monitor conversion rates for wallet connections and transactions
- **Performance Monitoring**: Track latency, transaction timing, and network metrics
- **Privacy Compliance**: Built-in GDPR compliance and privacy controls
- **Real-time Monitoring**: Automated alerts for critical metrics
- **WalletConnect Cloud Integration**: Sync analytics with WalletConnect Cloud
- **Dashboard**: Visual analytics dashboard with configurable metrics

## Architecture

### Core Services

#### 1. **AnalyticsService** (`analytics-service.ts`)
The foundation of the analytics system that tracks all user events.

**Key Features:**
- Event type enumeration (page_view, wallet_connection, transaction, etc.)
- Session management with unique session IDs
- User opt-in/opt-out mechanism
- localStorage persistence
- Wallet address tracking

**Usage:**
```typescript
import { analyticsService } from '@/services/analytics-service';

// Track an event
analyticsService.trackEvent('deposit_initiated', {
  amount: 1000,
  asset: 'BTC',
  wallet: '0x123...'
});

// Get session stats
const stats = analyticsService.getSessionStats();

// Opt out of tracking
analyticsService.optOut();
```

#### 2. **PrivacyManager** (`privacy-manager.ts`)
Manages GDPR compliance, cookie consent, and privacy settings.

**Key Features:**
- Cookie consent management (analytics, marketing, functional)
- GDPR data export functionality
- Privacy settings persistence
- Consent version tracking
- Data deletion on demand

**Usage:**
```typescript
import { privacyManager } from '@/services/privacy-manager';

// Save cookie consent
privacyManager.saveCookieConsent({
  analytics: true,
  marketing: false,
  functional: true
});

// Check if should show consent banner
if (privacyManager.shouldShowConsentBanner()) {
  // Display banner
}

// Export GDPR data
const gdprData = privacyManager.exportGdprData();
```

#### 3. **ErrorAnalyticsService** (`error-analytics.ts`)
Tracks and categorizes errors automatically.

**Error Categories:**
- wallet_errors (wallet connection, signing failures)
- network_errors (API, RPC failures)
- contract_errors (smart contract execution)
- validation_errors (input, data validation)
- performance_errors (timeouts, resource limits)
- security_errors (authorization, access control)
- unknown_errors (unclassified)

**Usage:**
```typescript
import { errorAnalyticsService } from '@/services/error-analytics';

// Record an error
errorAnalyticsService.recordError(error, {
  source: 'contract_execution',
  functionName: 'deposit'
});

// Get error summary
const summary = errorAnalyticsService.getSummary();

// Get top errors
const topErrors = errorAnalyticsService.getTopErrors();
```

#### 4. **FunnelAnalyticsService** (`funnel-analytics.ts`)
Tracks user progression through defined funnel steps.

**Pre-initialized Funnels:**
- wallet_connection: connect → authorize → confirm
- deposit_transaction: initiate → confirm → execute → complete
- withdrawal_transaction: initiate → confirm → execute → complete

**Usage:**
```typescript
import { funnelAnalyticsService } from '@/services/funnel-analytics';

// Track funnel step
funnelAnalyticsService.trackFunnelStep('wallet_connection', 'connect');

// Create custom funnel
funnelAnalyticsService.createFunnel('custom_flow', [
  'step1', 'step2', 'step3'
]);

// Get funnel analysis
const analysis = funnelAnalyticsService.getFunnelAnalysis('wallet_connection');
```

#### 5. **PerformanceMetricsService** (`performance-metrics.ts`)
Monitors transaction latency and performance metrics.

**Metrics Tracked:**
- Average latency
- P50, P95, P99 percentile latencies
- Min/max latencies
- Error rate
- Transaction counts

**Usage:**
```typescript
import { performanceMetricsService } from '@/services/performance-metrics';

// Record transaction latency
performanceMetricsService.recordLatency('deposit_transaction', 1250);

// Get performance metrics
const metrics = performanceMetricsService.getMetrics();
// Returns: { averageLatency, p50Latency, p95Latency, p99Latency, ... }
```

#### 6. **AnalyticsAggregationService** (`analytics-aggregation.ts`)
Aggregates data from all analytics sources for dashboard display.

**Aggregated Data:**
- Wallet metrics
- Transaction analytics
- User engagement
- Funnel analysis
- Performance metrics
- Top errors
- Network metrics
- User retention

**Usage:**
```typescript
import { analyticsAggregationService } from '@/services/analytics-aggregation';

// Get dashboard data
const dashboardData = await analyticsAggregationService.getDashboardData();

// Get retention metrics
const retention = analyticsAggregationService.getRetentionMetrics();
```

#### 7. **AnalyticsSetup** (`analytics-setup.ts`)
Initializes and orchestrates all analytics services.

**Responsibilities:**
- Service initialization
- Global error handler setup
- Page visibility tracking
- Auto page view tracking
- Core Web Vitals tracking
- Privacy manager initialization

**Usage:**
```typescript
import { analyticsSetup } from '@/services/analytics-setup';

// Initialize with default config
analyticsSetup.initialize();

// Initialize with custom config
analyticsSetup.initialize({
  enableErrorTracking: true,
  enableFunnelTracking: true,
  enablePerformanceTracking: true,
  environment: 'production'
});
```

#### 8. **AnalyticsMonitoringService** (`analytics-monitoring.ts`)
Real-time monitoring with automated alerts for critical metrics.

**Alert Types:**
- error_threshold_exceeded
- error_rate_threshold_exceeded
- recurring_error
- high_latency
- p95_latency_high
- p99_latency_critical
- connection_failures
- high_deposit_failure_rate
- high_withdrawal_failure_rate

**Usage:**
```typescript
import { analyticsMonitoringService } from '@/services/analytics-monitoring';

// Start monitoring
analyticsMonitoringService.startMonitoring({
  errorRateThreshold: 5,
  transactionLatencyThreshold: 3000,
  errorCountThreshold: 10
});

// Subscribe to alerts
const unsubscribe = analyticsMonitoringService.onAlert((alert) => {
  console.log(`Alert: ${alert.message}`, alert.data);
});

// Get active alerts
const alerts = analyticsMonitoringService.getAlerts();
```

### React Hooks

#### `useAnalytics()`
Provider hook for all analytics functionality.

**Returns:**
- trackEvent
- trackPageView
- getSessionStats
- optIn
- optOut

#### `usePageView()`
Auto-track page view events.

```typescript
function MyComponent() {
  usePageView('product-page');
  // Page view automatically tracked
}
```

#### `useWalletConnectionTracking()`
Track wallet connection events.

```typescript
function WalletConnect() {
  const { trackConnection, trackError } = useWalletConnectionTracking();
  
  const handleConnect = async () => {
    try {
      trackConnection('connect');
      // ... connection logic
      trackConnection('complete');
    } catch (error) {
      trackError(error);
    }
  };
}
```

#### `useTransactionTracking()`
Track transaction events (deposits, withdrawals).

```typescript
function DepositForm() {
  const { trackDeposit } = useTransactionTracking();
  
  const handleDeposit = async (amount) => {
    await trackDeposit(amount, 'initiated');
    // ... deposit logic
    await trackDeposit(amount, 'completed');
  };
}
```

#### `useSessionTracking()`
Track session-level metrics.

```typescript
function App() {
  useSessionTracking();
  // Session automatically tracked
}
```

### Components

#### `AnalyticsDashboard`
Visual dashboard displaying all analytics metrics.

**Features:**
- Multiple tabs (Overview, Wallets, Transactions, Funnel)
- Period selectors (Day, Week, Month)
- Real-time metric updates
- Error and alert displays

**Usage:**
```typescript
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';

function AdminPanel() {
  return <AnalyticsDashboard />;
}
```

#### `CookieConsentBanner`
GDPR-compliant cookie consent UI.

**Features:**
- Consent preferences (Analytics, Marketing, Functional)
- Detailed preference customization
- Required vs optional cookies
- localStorage persistence

**Usage:**
```typescript
import { CookieConsentBanner } from '@/components/CookieConsentBanner';

function App() {
  return (
    <>
      <CookieConsentBanner position="bottom" theme="light" />
      {/* Rest of app */}
    </>
  );
}
```

## Setup and Configuration

### Initialization

```typescript
// In your app's entry point (e.g., App.tsx)
import { analyticsSetup } from '@/services/analytics-setup';

function App() {
  useEffect(() => {
    analyticsSetup.initialize({
      enableErrorTracking: true,
      enableFunnelTracking: true,
      enablePerformanceTracking: true,
      enableWalletConnectSync: true,
      privacyFirstMode: false, // Set to true to disable analytics by default
      environment: 'production'
    });

    // Start monitoring
    analyticsMonitoringService.startMonitoring({
      errorRateThreshold: 5,
      transactionLatencyThreshold: 3000,
      connectionFailureThreshold: 3
    });
  }, []);

  return <CookieConsentBanner />;
}
```

### Environment Variables

```env
# Analytics Configuration
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_ENVIRONMENT=production

# WalletConnect Cloud
VITE_WALLETCONNECT_CLOUD_API_KEY=your_api_key
VITE_WALLETCONNECT_PROJECT_ID=your_project_id

# Monitoring Thresholds
VITE_ERROR_RATE_THRESHOLD=5
VITE_TRANSACTION_LATENCY_THRESHOLD=3000
VITE_CONNECTION_FAILURE_THRESHOLD=3
```

## Event Types

### Page Events
- `page_view`: Initial page load or navigation
- `page_navigation`: Browser back/forward
- `page_visibility`: Page visibility change

### Wallet Events
- `wallet_connection_initiated`: User initiates wallet connection
- `wallet_connection_authorized`: Wallet authorization approved
- `wallet_connection_confirmed`: Connection confirmed
- `wallet_connection_failed`: Connection failed
- `wallet_disconnected`: User disconnects wallet

### Transaction Events
- `deposit_initiated`: Deposit process starts
- `deposit_confirmed`: User confirms deposit
- `deposit_executed`: Deposit submitted to blockchain
- `deposit_completed`: Deposit successful
- `deposit_failed`: Deposit failed
- `withdrawal_initiated`: Withdrawal process starts
- `withdrawal_confirmed`: User confirms withdrawal
- `withdrawal_executed`: Withdrawal submitted to blockchain
- `withdrawal_completed`: Withdrawal successful
- `withdrawal_failed`: Withdrawal failed

### System Events
- `error_occurred`: Error event (automatically tracked)
- `performance_metric`: Performance measurement
- `connection_status`: Connection status change

## Privacy and GDPR Compliance

### Cookie Categories

**Functional Cookies** (Always enabled)
- Required for basic functionality and security
- Not subject to consent requirements

**Analytics Cookies** (Requires consent)
- RenVault analytics event tracking
- Performance monitoring
- Error tracking

**Marketing Cookies** (Requires consent)
- WalletConnect Cloud integration
- Third-party analytics

### User Rights

**Data Export (GDPR Article 20)**
```typescript
const userData = privacyManager.exportGdprData();
// Returns user's analytics data in portable format
```

**Data Deletion (GDPR Article 17)**
```typescript
privacyManager.deleteUserData();
// Permanently deletes all user analytics data
```

**Opt-out of Analytics**
```typescript
analyticsService.optOut();
// Stops all analytics tracking
```

## Monitoring and Alerts

### Alert Types

**Critical Alerts**
- High error rates exceeding threshold
- P99 latency exceeding threshold
- Multiple transaction failures

**Warning Alerts**
- Moderate error rates
- P95 latency concerning
- Recurring errors

**Info Alerts**
- No activity detected
- Connection failures below threshold

### Alert Handling

```typescript
analyticsMonitoringService.onAlert((alert) => {
  switch (alert.severity) {
    case 'critical':
      notifyAdmins(alert);
      logToSentry(alert);
      break;
    case 'warning':
      logToConsole(alert);
      break;
    case 'info':
      // Log only
      break;
  }
});
```

## Dashboard Metrics

### Overview Tab
- Active Users (current session)
- Total Events (current session)
- Error Count
- Average Transaction Time

### Wallets Tab
- Total Connected Wallets
- Connection Success Rate
- Popular Wallet Types
- Connection Time Trends

### Transactions Tab
- Total Transactions
- Deposit Success Rate
- Withdrawal Success Rate
- Average Transaction Amount
- Transaction Time Distribution

### Funnel Tab
- Connection Funnel (Connect → Authorize → Confirm)
- Deposit Funnel (Initiate → Confirm → Execute → Complete)
- Withdrawal Funnel (Initiate → Confirm → Execute → Complete)
- Dropout Analysis

## Performance Considerations

### Data Retention

- **Event Data**: Persisted to localStorage (default: 7 days rolling window)
- **Error Data**: 100 errors max in memory
- **Performance Metrics**: 1000 latency measurements max
- **Funnel Data**: 30 days rolling window

### Optimization

- Events batched for WalletConnect Cloud sync (50 events per batch)
- Sync interval: 30 seconds
- Cache expiry for dashboard data: 5 minutes
- LocalStorage quota: ~5MB

### Best Practices

1. **Avoid excessive event tracking** in tight loops
2. **Batch events** when possible
3. **Use error boundaries** to catch component errors
4. **Monitor alert thresholds** for your use case
5. **Export and archive** data regularly for compliance

## Troubleshooting

### Analytics Not Recording

1. Check privacy settings: `privacyManager.getPrivacySettings()`
2. Verify initialization: `analyticsSetup.isInitialized()`
3. Check localStorage available: `window.localStorage`

### High Error Rates

1. Review error categories: `errorAnalyticsService.getTopErrors()`
2. Check monitoring alerts: `analyticsMonitoringService.getAlerts()`
3. Review application logs for error patterns

### Performance Issues

1. Check latency metrics: `performanceMetricsService.getMetrics()`
2. Monitor P99 latency for outliers
3. Review transaction timing data

## Future Enhancements

- Real-time data visualization with WebSocket updates
- Predictive alerting using ML models
- Custom event tagging and filtering
- Export to third-party analytics services
- Analytics data visualization dashboards
- Segmentation and cohort analysis
- A/B testing framework integration

## Support

For issues or questions about the analytics system:
1. Check this documentation
2. Review the source code comments
3. Check the GitHub issues
4. Contact the development team

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Maintained By**: RenVault Development Team
