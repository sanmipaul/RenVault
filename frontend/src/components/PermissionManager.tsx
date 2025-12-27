// components/PermissionManager.tsx
import React, { useState, useEffect } from 'react';
import { PermissionService, Permission, PermissionType, PermissionStatus } from '../services/permissions/PermissionService';
import { useWallet } from '../hooks/useWallet';
import PermissionRequestDialog from './PermissionRequestDialog';
import './PermissionManager.css';

interface PermissionManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PermissionManager: React.FC<PermissionManagerProps> = ({ isOpen, onClose }) => {
  const { connectionState } = useWallet();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [pendingRequest, setPendingRequest] = useState<{
    permission: Permission;
    request: any;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const permissionService = PermissionService.getInstance();

  useEffect(() => {
    if (connectionState?.address && isOpen) {
      loadPermissions();
    }
  }, [connectionState?.address, isOpen]);

  const loadPermissions = () => {
    if (!connectionState?.address) return;

    const walletPermissions = permissionService.getWalletPermissions(connectionState.address);
    setPermissions(walletPermissions);
  };

  const handlePermissionToggle = async (permission: Permission) => {
    if (!connectionState?.address) return;

    setLoading(true);
    try {
      if (permission.status === PermissionStatus.GRANTED) {
        permissionService.revokePermission(connectionState.address, permission.type);
      } else {
        // Request permission with dialog
        const request = permissionService.getPermissionRequest(permission.type);
        setPendingRequest({ permission, request });
        return;
      }
      loadPermissions();
    } catch (error) {
      console.error('Error toggling permission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionGrant = () => {
    if (!pendingRequest || !connectionState?.address) return;

    permissionService.grantPermission(connectionState.address, pendingRequest.permission.type);
    setPendingRequest(null);
    loadPermissions();
  };

  const handlePermissionDeny = () => {
    setPendingRequest(null);
  };

  const getStatusColor = (status: PermissionStatus): string => {
    switch (status) {
      case PermissionStatus.GRANTED: return '#10b981';
      case PermissionStatus.DENIED: return '#ef4444';
      case PermissionStatus.PENDING: return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: PermissionStatus): string => {
    switch (status) {
      case PermissionStatus.GRANTED: return 'Granted';
      case PermissionStatus.DENIED: return 'Denied';
      case PermissionStatus.PENDING: return 'Pending';
      default: return 'Not Requested';
    }
  };

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

  if (!isOpen) return null;

  return (
    <>
      <div className="permission-manager-overlay" onClick={onClose}>
        <div className="permission-manager" onClick={(e) => e.stopPropagation()}>
          <div className="permission-header">
            <h2>🔐 Permission Management</h2>
            <p>Control what RenVault can access from your wallet</p>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          <div className="permission-content">
            {!connectionState?.address ? (
              <div className="no-wallet">
                <p>🔗 Please connect your wallet to manage permissions.</p>
              </div>
            ) : (
              <div className="permissions-list">
                {permissions.map((permission) => (
                  <div key={permission.type} className="permission-item">
                    <div className="permission-info">
                      <div className="permission-icon">
                        {getPermissionIcon(permission.type)}
                      </div>
                      <div className="permission-details">
                        <h4>{permissionService.getPermissionRequest(permission.type).title}</h4>
                        <p>{permission.description}</p>
                        <div className="permission-meta">
                          <span
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(permission.status) }}
                          >
                            {getStatusText(permission.status)}
                          </span>
                          {permission.required && (
                            <span className="required-badge">Required</span>
                          )}
                          {permission.grantedAt && (
                            <span className="granted-date">
                              Granted: {permission.grantedAt.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="permission-controls">
                      <label className="permission-toggle">
                        <input
                          type="checkbox"
                          checked={permission.status === PermissionStatus.GRANTED}
                          onChange={() => handlePermissionToggle(permission)}
                          disabled={loading || permission.required}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="permission-info-section">
              <h3>🛡️ Privacy Information</h3>
              <ul>
                <li><strong>Granular Control:</strong> Each permission can be granted or revoked individually.</li>
                <li><strong>Privacy First:</strong> Only essential permissions are enabled by default.</li>
                <li><strong>Temporary Access:</strong> Permissions can be revoked at any time.</li>
                <li><strong>Secure Requests:</strong> Permission requests clearly explain what access is needed.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {pendingRequest && (
        <PermissionRequestDialog
          permissionRequest={pendingRequest.request}
          onGrant={handlePermissionGrant}
          onDeny={handlePermissionDeny}
        />
      )}
    </>
  );
};

export default PermissionManager;