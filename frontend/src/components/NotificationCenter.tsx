import React, { useState, useEffect } from 'react';
import { notificationService, NotificationItem, NotificationPreferences } from '../services/notification-service';

interface NotificationCenterProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  userId,
  isOpen,
  onClose
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [activeTab, setActiveTab] = useState<'notifications' | 'preferences'>('notifications');

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      loadPreferences();
      setupListeners();
    }

    return () => {
      // Cleanup listeners
    };
  }, [isOpen, userId]);

  const loadNotifications = () => {
    const userNotifications = notificationService.getNotifications(userId);
    setNotifications(userNotifications);
  };

  const loadPreferences = () => {
    const userPrefs = notificationService.getUserPreferences(userId);
    setPreferences(userPrefs || {
      emailEnabled: false,
      pushEnabled: false,
      web3Enabled: false,
      eventTypes: {
        deposits: true,
        withdrawals: true,
        vaultCreated: true,
        vaultUpdated: true,
        rewards: true,
        maturity: true,
        priceAlerts: false,
        largeTransactions: true,
        multisig: true,
        session: true
      },
      frequency: 'instant',
      doNotDisturb: false
    });
  };

  const setupListeners = () => {
    const handleNotificationAdded = (notification: NotificationItem) => {
      setNotifications(prev => [notification, ...prev]);
    };

    const handleNotificationRead = () => {
      loadNotifications();
    };

    notificationService.on('notificationAdded', handleNotificationAdded);
    notificationService.on('notificationRead', handleNotificationRead);
    notificationService.on('notificationDeleted', loadNotifications);

    return () => {
      notificationService.off('notificationAdded', handleNotificationAdded);
      notificationService.off('notificationRead', handleNotificationRead);
      notificationService.off('notificationDeleted', loadNotifications);
    };
  };

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead(userId);
  };

  const handleDeleteNotification = (notificationId: string) => {
    notificationService.deleteNotification(notificationId);
  };

  const handlePreferencesChange = (newPreferences: NotificationPreferences) => {
    notificationService.setUserPreferences(userId, newPreferences);
    notificationService.updateBackendPreferences(userId, newPreferences);
    setPreferences(newPreferences);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deposit': return '🏦';
      case 'withdrawal': return '💰';
      case 'vault_created': return '🏦';
      case 'vault_updated': return '🔄';
      case 'rewards': return '💰';
      case 'maturity': return '⏰';
      case 'price_alert': return '📈';
      case 'security': return '🚨';
      case 'multisig': return '🔐';
      case 'session': return '⏳';
      default: return '🔔';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-center-overlay" onClick={onClose}>
      <div className="notification-center" onClick={e => e.stopPropagation()}>
        <div className="notification-center-header">
          <h2>Notifications</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="notification-center-tabs">
          <button
            className={activeTab === 'notifications' ? 'active' : ''}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications ({notifications.filter(n => !n.read).length})
          </button>
          <button
            className={activeTab === 'preferences' ? 'active' : ''}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
        </div>

        {activeTab === 'notifications' && (
          <div className="notifications-list">
            <div className="notifications-actions">
              <button onClick={handleMarkAllAsRead}>
                Mark All as Read
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="no-notifications">
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>
                  <div className="notification-actions">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'preferences' && preferences && (
          <NotificationPreferencesPanel
            preferences={preferences}
            onChange={handlePreferencesChange}
          />
        )}
      </div>
    </div>
  );
};

interface NotificationPreferencesPanelProps {
  preferences: NotificationPreferences;
  onChange: (preferences: NotificationPreferences) => void;
}

const NotificationPreferencesPanel: React.FC<NotificationPreferencesPanelProps> = ({
  preferences,
  onChange
}) => {
  const handleToggle = (key: keyof NotificationPreferences['eventTypes']) => {
    onChange({
      ...preferences,
      eventTypes: {
        ...preferences.eventTypes,
        [key]: !preferences.eventTypes[key]
      }
    });
  };

  const handleChannelToggle = (channel: 'emailEnabled' | 'pushEnabled' | 'web3Enabled') => {
    onChange({
      ...preferences,
      [channel]: !preferences[channel]
    });
  };

  return (
    <div className="notification-preferences">
      <div className="preferences-section">
        <h3>Notification Channels</h3>
        <label>
          <input
            type="checkbox"
            checked={preferences.emailEnabled}
            onChange={() => handleChannelToggle('emailEnabled')}
          />
          Email Notifications
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.pushEnabled}
            onChange={() => handleChannelToggle('pushEnabled')}
          />
          Push Notifications
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.web3Enabled}
            onChange={() => handleChannelToggle('web3Enabled')}
          />
          Web3 Notifications
        </label>
      </div>

      <div className="preferences-section">
        <h3>Event Types</h3>
        <label>
          <input
            type="checkbox"
            checked={preferences.eventTypes.deposits}
            onChange={() => handleToggle('deposits')}
          />
          Deposit Confirmations
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.eventTypes.withdrawals}
            onChange={() => handleToggle('withdrawals')}
          />
          Withdrawal Confirmations
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.eventTypes.vaultCreated}
            onChange={() => handleToggle('vaultCreated')}
          />
          New Vault Creations
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.eventTypes.vaultUpdated}
            onChange={() => handleToggle('vaultUpdated')}
          />
          Vault Updates
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.eventTypes.rewards}
            onChange={() => handleToggle('rewards')}
          />
          Reward Distributions
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.eventTypes.maturity}
            onChange={() => handleToggle('maturity')}
          />
          Vault Maturity Alerts
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.eventTypes.priceAlerts}
            onChange={() => handleToggle('priceAlerts')}
          />
          Price Alerts
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.eventTypes.largeTransactions}
            onChange={() => handleToggle('largeTransactions')}
          />
          Large Transaction Alerts
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.eventTypes.multisig}
            onChange={() => handleToggle('multisig')}
          />
          Multi-signature Requests
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.eventTypes.session}
            onChange={() => handleToggle('session')}
          />
          Session Expiration Warnings
        </label>
      </div>

      <div className="preferences-section">
        <h3>Settings</h3>
        <label>
          Frequency:
          <select
            value={preferences.frequency}
            onChange={(e) => onChange({
              ...preferences,
              frequency: e.target.value as 'instant' | 'digest'
            })}
          >
            <option value="instant">Instant</option>
            <option value="digest">Daily Digest</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.doNotDisturb}
            onChange={() => onChange({
              ...preferences,
              doNotDisturb: !preferences.doNotDisturb
            })}
          />
          Do Not Disturb
        </label>
      </div>
    </div>
  );
};
