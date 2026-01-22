import React, { useState, useEffect } from 'react';
import { notificationService, NotificationPreferences } from '../services/notification-service';

interface NotificationPreferencesProps {
  userId: string;
  onClose: () => void;
}

export const NotificationPreferencesComponent: React.FC<NotificationPreferencesProps> = ({
  userId,
  onClose
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    try {
      const userPrefs = notificationService.getUserPreferences(userId);
      if (userPrefs) {
        setPreferences(userPrefs);
      } else {
        // Default preferences
        const defaultPrefs: NotificationPreferences = {
          emailEnabled: false,
          pushEnabled: true,
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
        };
        setPreferences(defaultPrefs);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      notificationService.setUserPreferences(userId, preferences);
      await notificationService.updateBackendPreferences(userId, preferences);

      // Request notification permission if enabling push
      if (preferences.pushEnabled) {
        const granted = await notificationService.requestNotificationPermission();
        if (!granted) {
          alert('Push notifications permission denied. Please enable in browser settings.');
        }
      }

      // Subscribe to Web3 notifications if enabled
      if (preferences.web3Enabled) {
        await notificationService.subscribeToWeb3Notifications(userId);
      }

      alert('Preferences saved successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEventTypeToggle = (eventType: keyof NotificationPreferences['eventTypes']) => {
    if (!preferences) return;

    setPreferences({
      ...preferences,
      eventTypes: {
        ...preferences.eventTypes,
        [eventType]: !preferences.eventTypes[eventType]
      }
    });
  };

  const handleChannelToggle = (channel: 'emailEnabled' | 'pushEnabled' | 'web3Enabled') => {
    if (!preferences) return;

    setPreferences({
      ...preferences,
      [channel]: !preferences[channel]
    });
  };

  if (loading) {
    return <div className="loading">Loading preferences...</div>;
  }

  if (!preferences) {
    return <div className="error">Failed to load preferences</div>;
  }

  return (
    <div className="notification-preferences-modal">
      <div className="modal-header">
        <h2>Notification Preferences</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="modal-body">
        <div className="preferences-section">
          <h3>Notification Channels</h3>
          <div className="channel-option">
            <label>
              <input
                type="checkbox"
                checked={preferences.emailEnabled}
                onChange={() => handleChannelToggle('emailEnabled')}
              />
              <span className="channel-icon">📧</span>
              <div>
                <strong>Email Notifications</strong>
                <p>Receive notifications via email</p>
              </div>
            </label>
          </div>

          <div className="channel-option">
            <label>
              <input
                type="checkbox"
                checked={preferences.pushEnabled}
                onChange={() => handleChannelToggle('pushEnabled')}
              />
              <span className="channel-icon">🔔</span>
              <div>
                <strong>Push Notifications</strong>
                <p>Receive browser push notifications</p>
              </div>
            </label>
          </div>

          <div className="channel-option">
            <label>
              <input
                type="checkbox"
                checked={preferences.web3Enabled}
                onChange={() => handleChannelToggle('web3Enabled')}
              />
              <span className="channel-icon">🌐</span>
              <div>
                <strong>Web3 Notifications</strong>
                <p>Receive notifications via WalletConnect/AppKit</p>
              </div>
            </label>
          </div>
        </div>

        <div className="preferences-section">
          <h3>Event Types</h3>
          <div className="event-grid">
            <div className="event-option">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.eventTypes.deposits}
                  onChange={() => handleEventTypeToggle('deposits')}
                />
                <span className="event-icon">🏦</span>
                <div>
                  <strong>Deposits</strong>
                  <p>Deposit confirmations</p>
                </div>
              </label>
            </div>

            <div className="event-option">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.eventTypes.withdrawals}
                  onChange={() => handleEventTypeToggle('withdrawals')}
                />
                <span className="event-icon">💰</span>
                <div>
                  <strong>Withdrawals</strong>
                  <p>Withdrawal confirmations</p>
                </div>
              </label>
            </div>

            <div className="event-option">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.eventTypes.vaultCreated}
                  onChange={() => handleEventTypeToggle('vaultCreated')}
                />
                <span className="event-icon">🏦</span>
                <div>
                  <strong>New Vaults</strong>
                  <p>Vault creation notifications</p>
                </div>
              </label>
            </div>

            <div className="event-option">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.eventTypes.vaultUpdated}
                  onChange={() => handleEventTypeToggle('vaultUpdated')}
                />
                <span className="event-icon">🔄</span>
                <div>
                  <strong>Vault Updates</strong>
                  <p>Vault parameter changes</p>
                </div>
              </label>
            </div>

            <div className="event-option">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.eventTypes.rewards}
                  onChange={() => handleEventTypeToggle('rewards')}
                />
                <span className="event-icon">💰</span>
                <div>
                  <strong>Rewards</strong>
                  <p>Reward distributions</p>
                </div>
              </label>
            </div>

            <div className="event-option">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.eventTypes.maturity}
                  onChange={() => handleEventTypeToggle('maturity')}
                />
                <span className="event-icon">⏰</span>
                <div>
                  <strong>Vault Maturity</strong>
                  <p>Maturity approaching alerts</p>
                </div>
              </label>
            </div>

            <div className="event-option">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.eventTypes.priceAlerts}
                  onChange={() => handleEventTypeToggle('priceAlerts')}
                />
                <span className="event-icon">📈</span>
                <div>
                  <strong>Price Alerts</strong>
                  <p>Asset price changes</p>
                </div>
              </label>
            </div>

            <div className="event-option">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.eventTypes.largeTransactions}
                  onChange={() => handleEventTypeToggle('largeTransactions')}
                />
                <span className="event-icon">🚨</span>
                <div>
                  <strong>Security Alerts</strong>
                  <p>Large transaction warnings</p>
                </div>
              </label>
            </div>

            <div className="event-option">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.eventTypes.multisig}
                  onChange={() => handleEventTypeToggle('multisig')}
                />
                <span className="event-icon">🔐</span>
                <div>
                  <strong>Multi-sig</strong>
                  <p>Approval requests</p>
                </div>
              </label>
            </div>

            <div className="event-option">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.eventTypes.session}
                  onChange={() => handleEventTypeToggle('session')}
                />
                <span className="event-icon">⏳</span>
                <div>
                  <strong>Session</strong>
                  <p>Expiration warnings</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="preferences-section">
          <h3>Advanced Settings</h3>
          <div className="setting-option">
            <label>
              <span>Frequency:</span>
              <select
                value={preferences.frequency}
                onChange={(e) => setPreferences({
                  ...preferences,
                  frequency: e.target.value as 'instant' | 'digest'
                })}
              >
                <option value="instant">Instant</option>
                <option value="digest">Daily Digest</option>
              </select>
            </label>
          </div>

          <div className="setting-option">
            <label>
              <input
                type="checkbox"
                checked={preferences.doNotDisturb}
                onChange={() => setPreferences({
                  ...preferences,
                  doNotDisturb: !preferences.doNotDisturb
                })}
              />
              <span>Do Not Disturb</span>
              <p>Pause notifications during quiet hours</p>
            </label>
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button className="cancel-button" onClick={onClose}>
          Cancel
        </button>
        <button
          className="save-button"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};
