// components/SecuritySettings.tsx
import React from 'react';
import NotificationService from '../services/notificationService';
import './SecuritySettings.css';

interface SecuritySettingsProps {
  is2FAEnabled: boolean;
  onEnable2FA: () => void;
  onDisable2FA: () => void;
  onSignOutAllSessions: () => void;
  notificationUserId: string | null;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  is2FAEnabled,
  onEnable2FA,
  onDisable2FA,
  onSignOutAllSessions,
  notificationUserId,
}) => {
  const handleTestSecurityAlert = () => {
    if (!notificationUserId) return;
    const service = NotificationService.getInstance(notificationUserId);
    service.testFailedLoginNotification('192.168.1.100', 'Chrome/91.0');
  };

  return (
    <div className="card">
      <h3>Security Settings</h3>
      <div className="security-options">
        <div className="security-item">
          <h4>Two-Factor Authentication</h4>
          <p>Add an extra layer of security to your account</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-primary"
              onClick={onEnable2FA}
              disabled={is2FAEnabled}
            >
              {is2FAEnabled ? '2FA Enabled' : 'Enable 2FA'}
            </button>
            {is2FAEnabled && (
              <button className="btn btn-outline" onClick={onDisable2FA}>
                Disable 2FA
              </button>
            )}
          </div>
        </div>
        <div className="security-item">
          <h4>Session Management</h4>
          <p>Manage your active sessions</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={onSignOutAllSessions}>
              Sign Out All Sessions
            </button>
            <button className="btn btn-outline" onClick={handleTestSecurityAlert}>
              Test Security Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
