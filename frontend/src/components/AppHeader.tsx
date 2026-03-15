// components/AppHeader.tsx
import React from 'react';
import { NetworkType } from '../types/app';

interface AppHeaderProps {
  userName?: string;
  detectedNetwork: NetworkType | null;
  onOpenNotifications: () => void;
  onOpenWalletBackup: () => void;
  onOpenWalletRecovery: () => void;
  onOpenMultiSigSetup: () => void;
  onOpenCoSignerManagement: () => void;
  onOpenMultiSigSigner: () => void;
  onOpenPerformanceMonitor: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  userName,
  detectedNetwork,
  onOpenNotifications,
  onOpenWalletBackup,
  onOpenWalletRecovery,
  onOpenMultiSigSetup,
  onOpenCoSignerManagement,
  onOpenMultiSigSigner,
  onOpenPerformanceMonitor,
}) => {
  return (
    <div className="header">
      <h1>RenVault</h1>
      <p>Welcome, {userName || 'Stacker'}</p>
      <div className="header-actions">
        <button
          className="notification-button"
          onClick={onOpenNotifications}
          title="Notifications"
        >
          Notifications
        </button>
        <button className="btn btn-outline" onClick={onOpenWalletBackup} title="Backup Wallet">
          Backup
        </button>
        <button className="btn btn-outline" onClick={onOpenWalletRecovery} title="Recover Wallet">
          Recover
        </button>
        <button className="btn btn-outline" onClick={onOpenMultiSigSetup} title="Setup Multi-Sig">
          Multi-Sig
        </button>
        <button
          className="btn btn-outline"
          onClick={onOpenCoSignerManagement}
          title="Manage Co-Signers"
        >
          Co-Signers
        </button>
        <button
          className="btn btn-outline"
          onClick={onOpenMultiSigSigner}
          title="Sign Multi-Sig Transactions"
        >
          Sign Tx
        </button>
        <button
          className="btn btn-outline"
          onClick={onOpenPerformanceMonitor}
          title="Performance Monitor"
        >
          Perf
        </button>
        {detectedNetwork && (
          <div className="network-indicator">
            <span className={`network-badge ${detectedNetwork}`}>
              {detectedNetwork.toUpperCase()}
            </span>
            <button
              className="btn btn-secondary"
              style={{ marginLeft: '12px', fontSize: '0.8rem', padding: '4px 8px' }}
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppHeader;
