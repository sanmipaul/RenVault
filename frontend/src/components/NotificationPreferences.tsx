import React, { useState, useEffect } from 'react';
import './NotificationPreferences.css';

interface NotificationPreferences {
  email: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  // Transaction notifications
  depositNotifications: boolean;
  withdrawalNotifications: boolean;
  stakingNotifications: boolean;
  rewardNotifications: boolean;
  // Security alerts
  securityAlerts: boolean;
  loginAlerts: boolean;
  suspiciousActivityAlerts: boolean;
  twoFactorAlerts: boolean;
  // Sound settings
  soundEnabled: boolean;
  soundVolume: number;
  vibrationEnabled: boolean;
}

interface NotificationPreferencesProps {
  userId: string;
  onClose: () => void;
}

const NotificationPreferencesComponent: React.FC<NotificationPreferencesProps> = ({
  userId,
  onClose
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: '',
    emailEnabled: false,
    pushEnabled: false,
    depositNotifications: true,
    withdrawalNotifications: true,
    stakingNotifications: true,
    rewardNotifications: true,
    securityAlerts: true,
    loginAlerts: true,
    suspiciousActivityAlerts: true,
    twoFactorAlerts: true,
    soundEnabled: true,
    soundVolume: 50,
    vibrationEnabled: true
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load existing preferences from localStorage or API
    const saved = localStorage.getItem(`notificationPrefs_${userId}`);
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, [userId]);

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Save to localStorage
      localStorage.setItem(`notificationPrefs_${userId}`, JSON.stringify(preferences));

      // Send to API
      const response = await fetch('http://localhost:3003/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          preferences
        }),
      });

      if (response.ok) {
        setMessage('✅ Preferences saved successfully!');
        setTimeout(() => onClose(), 2000);
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage('❌ Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePushSubscription = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY || '')
        });

        const response = await fetch('http://localhost:3003/api/notifications/subscribe-push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            endpoint: subscription.endpoint,
            keys: subscription.toJSON().keys
          }),
        });

        if (response.ok) {
          handlePreferenceChange('pushEnabled', true);
          setMessage('✅ Push notifications enabled!');
        } else {
          throw new Error('Failed to subscribe to push notifications');
        }
      } catch (error) {
        console.error('Error subscribing to push notifications:', error);
        setMessage('❌ Failed to enable push notifications.');
      }
    } else {
      setMessage('❌ Push notifications not supported in this browser.');
    }
  };

  return (
    <div className="notification-preferences-modal">
      <div className="notification-preferences-content">
        <div className="notification-preferences-header">
          <h2>🔔 Notification Preferences</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="notification-preferences-body">
          {/* Email Settings */}
          <div className="preference-section">
            <h3>📧 Email Notifications</h3>
            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.emailEnabled}
                  onChange={(e) => handlePreferenceChange('emailEnabled', e.target.checked)}
                />
                Enable email notifications
              </label>
            </div>
            {preferences.emailEnabled && (
              <div className="preference-item">
                <label>
                  Email address:
                  <input
                    type="email"
                    value={preferences.email}
                    onChange={(e) => handlePreferenceChange('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Push Notifications */}
          <div className="preference-section">
            <h3>📱 Push Notifications</h3>
            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.pushEnabled}
                  onChange={(e) => handlePreferenceChange('pushEnabled', e.target.checked)}
                />
                Enable push notifications
              </label>
            </div>
            {!preferences.pushEnabled && (
              <button
                className="enable-push-button"
                onClick={handlePushSubscription}
              >
                Enable Push Notifications
              </button>
            )}
          </div>

          {/* Transaction Notifications */}
          <div className="preference-section">
            <h3>💰 Transaction Notifications</h3>
            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.depositNotifications}
                  onChange={(e) => handlePreferenceChange('depositNotifications', e.target.checked)}
                />
                Deposit confirmations
              </label>
            </div>
            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.withdrawalNotifications}
                  onChange={(e) => handlePreferenceChange('withdrawalNotifications', e.target.checked)}
                />
                Withdrawal confirmations
              </label>
            </div>
            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.stakingNotifications}
                  onChange={(e) => handlePreferenceChange('stakingNotifications', e.target.checked)}
                />
                Staking rewards
              </label>
            </div>
            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.rewardNotifications}
                  onChange={(e) => handlePreferenceChange('rewardNotifications', e.target.checked)}
                />
                Liquidity rewards
              </label>
            </div>
          </div>

          {/* Security Alerts */}
          <div className="preference-section">
            <h3>🚨 Security Alerts</h3>
            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.securityAlerts}
                  onChange={(e) => handlePreferenceChange('securityAlerts', e.target.checked)}
                />
                Enable security alerts
              </label>
            </div>
            {preferences.securityAlerts && (
              <>
                <div className="preference-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={preferences.loginAlerts}
                      onChange={(e) => handlePreferenceChange('loginAlerts', e.target.checked)}
                    />
                    Failed login attempts
                  </label>
                </div>
                <div className="preference-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={preferences.suspiciousActivityAlerts}
                      onChange={(e) => handlePreferenceChange('suspiciousActivityAlerts', e.target.checked)}
                    />
                    Suspicious activity
                  </label>
                </div>
                <div className="preference-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={preferences.twoFactorAlerts}
                      onChange={(e) => handlePreferenceChange('twoFactorAlerts', e.target.checked)}
                    />
                    2FA changes
                  </label>
                </div>
              </>
            )}
          </div>

          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="preference-actions">
            <button
              className="save-button"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
          </div>

          {/* Sound & Vibration Settings */}
          <div className="preference-section">
            <h3>🔊 Sound & Vibration</h3>
            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.soundEnabled}
                  onChange={(e) => handlePreferenceChange('soundEnabled', e.target.checked)}
                />
                Enable notification sounds
              </label>
            </div>
            {preferences.soundEnabled && (
              <div className="preference-item">
                <label>
                  Volume: {preferences.soundVolume}%
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.soundVolume}
                    onChange={(e) => handlePreferenceChange('soundVolume', parseInt(e.target.value))}
                    className="volume-slider"
                  />
                </label>
              </div>
            )}
            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.vibrationEnabled}
                  onChange={(e) => handlePreferenceChange('vibrationEnabled', e.target.checked)}
                />
                Enable vibration
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for VAPID key conversion
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCode(i);
  }
  return outputArray;
}

export default NotificationPreferencesComponent;