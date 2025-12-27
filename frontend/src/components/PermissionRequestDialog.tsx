// components/PermissionRequestDialog.tsx
import React, { useState, useEffect } from 'react';
import { PermissionType, PermissionRequest } from '../services/permissions/PermissionService';
import './PermissionRequestDialog.css';

interface PermissionRequestDialogProps {
  permissionRequest: PermissionRequest;
  onGrant: () => void;
  onDeny: () => void;
  onClose?: () => void;
}

const PermissionRequestDialog: React.FC<PermissionRequestDialogProps> = ({
  permissionRequest,
  onGrant,
  onDeny,
  onClose
}) => {
  const [dontAskAgain, setDontAskAgain] = useState(false);

  const getPermissionIcon = (type: PermissionType): string => {
    const icons: Record<PermissionType, string> = {
      [PermissionType.BALANCE_READ]: '💰',
      [PermissionType.TRANSACTION_SIGN]: '✍️',
      [PermissionType.ADDRESS_READ]: '🏠',
      [PermissionType.NETWORK_SWITCH]: '🌐',
      [PermissionType.CONTRACT_CALL]: '📄',
      [PermissionType.NOTIFICATION_SEND]: '🔔',
      [PermissionType.STORAGE_ACCESS]: '💾'
    };
    return icons[type] || '🔒';
  };

  const getPermissionColor = (type: PermissionType): string => {
    const colors: Record<PermissionType, string> = {
      [PermissionType.BALANCE_READ]: '#10b981',
      [PermissionType.TRANSACTION_SIGN]: '#f59e0b',
      [PermissionType.ADDRESS_READ]: '#3b82f6',
      [PermissionType.NETWORK_SWITCH]: '#8b5cf6',
      [PermissionType.CONTRACT_CALL]: '#ef4444',
      [PermissionType.NOTIFICATION_SEND]: '#06b6d4',
      [PermissionType.STORAGE_ACCESS]: '#84cc16'
    };
    return colors[type] || '#6b7280';
  };

  const handleGrant = () => {
    onGrant();
    if (onClose) onClose();
  };

  const handleDeny = () => {
    onDeny();
    if (onClose) onClose();
  };

  return (
    <div className="permission-dialog-overlay">
      <div className="permission-dialog">
        <div className="permission-header">
          <div
            className="permission-icon"
            style={{ backgroundColor: getPermissionColor(permissionRequest.type) }}
          >
            {getPermissionIcon(permissionRequest.type)}
          </div>
          <h3>{permissionRequest.title}</h3>
          <p className="permission-subtitle">Permission Request</p>
        </div>

        <div className="permission-content">
          <div className="permission-description">
            <h4>Description</h4>
            <p>{permissionRequest.description}</p>
          </div>

          {permissionRequest.rationale && (
            <div className="permission-rationale">
              <h4>Why is this needed?</h4>
              <p>{permissionRequest.rationale}</p>
            </div>
          )}

          <div className="permission-details">
            <div className="detail-item">
              <span className="label">Type:</span>
              <span className="value">{permissionRequest.required ? 'Required' : 'Optional'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Access:</span>
              <span className="value">Temporary</span>
            </div>
          </div>

          {!permissionRequest.required && (
            <div className="permission-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={dontAskAgain}
                  onChange={(e) => setDontAskAgain(e.target.checked)}
                />
                <span className="checkbox-text">Don't ask again for this permission</span>
              </label>
            </div>
          )}
        </div>

        <div className="permission-actions">
          <button
            className="deny-btn"
            onClick={handleDeny}
            disabled={permissionRequest.required}
          >
            {permissionRequest.required ? 'Cancel' : 'Deny'}
          </button>
          <button
            className="grant-btn"
            onClick={handleGrant}
            style={{ backgroundColor: getPermissionColor(permissionRequest.type) }}
          >
            Grant Permission
          </button>
        </div>

        <div className="permission-footer">
          <p>
            You can manage permissions later in your wallet settings.
            {permissionRequest.required && (
              <span className="required-note"> This permission is required for the requested action.</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PermissionRequestDialog;