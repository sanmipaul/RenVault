import React, { useState, useEffect } from 'react';
import NotificationService from '../services/notificationService';
import NotificationPreferences from './NotificationPreferences';
import './NotificationCenter.css';

interface Notification {
  id: string;
  type: 'transaction' | 'security' | 'reward' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface NotificationCenterProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  userId,
  isOpen,
  onClose
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'transaction' | 'security' | 'reward'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const notificationService = new NotificationService(userId);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = () => {
    // Load notifications from localStorage (in a real app, this would come from an API)
    const saved = localStorage.getItem(`notifications_${userId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotifications(parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      })));
    } else {
      // Add some sample notifications for demo
      const sampleNotifications: Notification[] = [
        {
          id: '1',
          type: 'transaction',
          title: 'Deposit Confirmed',
          message: 'Your deposit of 100 STX has been confirmed.',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: false,
          data: { amount: 100, type: 'deposit' }
        },
        {
          id: '2',
          type: 'security',
          title: 'Security Alert',
          message: 'Failed login attempt detected from 192.168.1.1',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: false,
          data: { alertType: 'failed_login', ipAddress: '192.168.1.1' }
        },
        {
          id: '3',
          type: 'reward',
          title: 'Staking Reward',
          message: 'You earned 5 STX in staking rewards!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: true,
          data: { amount: 5, type: 'staking' }
        }
      ];
      setNotifications(sampleNotifications);
      localStorage.setItem(`notifications_${userId}`, JSON.stringify(sampleNotifications));
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    );
    // Save to localStorage
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem(`notifications_${userId}`);
  };

  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');

  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = (() => {
      switch (filter) {
        case 'unread':
          return !n.read;
        case 'transaction':
          return n.type === 'transaction';
        case 'security':
          return n.type === 'security';
        case 'reward':
          return n.type === 'reward';
        default:
          return true;
      }
    })();

    const matchesSearch = searchTerm === '' ||
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'transaction':
        return '💰';
      case 'security':
        return '🚨';
      case 'reward':
        return '🎁';
      case 'system':
        return 'ℹ️';
      default:
        return '🔔';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="notification-center-overlay" onClick={onClose}>
        <div className="notification-center" data-theme={theme} onClick={e => e.stopPropagation()}>
          <div className="notification-center-header">
            <h2>🔔 Notifications {notifications.filter(n => !n.read).length > 0 && <span className="notification-badge">{notifications.filter(n => !n.read).length}</span>}</h2>
            <div className="notification-actions">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'auto')}
                className="theme-selector"
              >
                <option value="light">☀️ Light</option>
                <option value="dark">🌙 Dark</option>
                <option value="auto">🌓 Auto</option>
              </select>
              <button
                className="preferences-button"
                onClick={() => setShowPreferences(true)}
              >
                ⚙️ Settings
              </button>
              <button className="close-button" onClick={onClose}>×</button>
            </div>
          </div>

          <div className="notification-filters">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button
              className={filter === 'unread' ? 'active' : ''}
              onClick={() => setFilter('unread')}
            >
              Unread ({notifications.filter(n => !n.read).length})
            </button>
            <button
              className={filter === 'transaction' ? 'active' : ''}
              onClick={() => setFilter('transaction')}
            >
              Transactions
            </button>
            <button
              className={filter === 'security' ? 'active' : ''}
              onClick={() => setFilter('security')}
            >
              Security
            </button>
            <button
              className={filter === 'reward' ? 'active' : ''}
              onClick={() => setFilter('reward')}
            >
              Rewards
            </button>
          </div>

          <div className="notification-list">
            {filteredNotifications.length === 0 ? (
              <div className="no-notifications">
                <div className="no-notifications-icon">📭</div>
                <p>No notifications to show</p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{formatTime(notification.timestamp)}</div>
                  </div>
                  {!notification.read && <div className="unread-indicator"></div>}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <button className="mark-all-read-button" onClick={markAllAsRead}>
                Mark all as read
              </button>
              <button className="clear-all-button" onClick={clearAll}>
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {showPreferences && (
        <NotificationPreferences
          userId={userId}
          onClose={() => setShowPreferences(false)}
        />
      )}
    </>
  );
};

export default NotificationCenter;