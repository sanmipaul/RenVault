// components/WalletActionModals.tsx
// Renders all wallet-related modal overlays (backup, recovery, multi-sig, performance).
import React from 'react';
import { WalletBackup } from './WalletBackup';
import { WalletRecovery } from './WalletRecovery';
import { MultiSigSetup } from './MultiSigSetup';
import { CoSignerManagement } from './CoSignerManagement';
import { MultiSigTransactionSigner } from './MultiSigTransactionSigner';
import { PerformanceMonitor } from './PerformanceMonitor';
import { WalletManager } from '../services/wallet/WalletManager';

interface WalletActionModalsProps {
  walletManager: WalletManager;
  showWalletBackup: boolean;
  showWalletRecovery: boolean;
  showMultiSigSetup: boolean;
  showCoSignerManagement: boolean;
  showMultiSigSigner: boolean;
  showPerformanceMonitor: boolean;
  currentTransaction: any;
  onBackupComplete: (data: string) => void;
  onRecoveryComplete: () => void;
  onMultiSigSetupComplete: () => void;
  onCoSignerUpdate: () => void;
  onMultiSigTransactionSigned: (signedTx: any) => void;
  onCloseBackup: () => void;
  onCloseRecovery: () => void;
  onCloseMultiSigSetup: () => void;
  onCloseCoSignerManagement: () => void;
  onCloseMultiSigSigner: () => void;
  onClosePerformanceMonitor: () => void;
}

const WalletActionModals: React.FC<WalletActionModalsProps> = ({
  walletManager,
  showWalletBackup,
  showWalletRecovery,
  showMultiSigSetup,
  showCoSignerManagement,
  showMultiSigSigner,
  showPerformanceMonitor,
  currentTransaction,
  onBackupComplete,
  onRecoveryComplete,
  onMultiSigSetupComplete,
  onCoSignerUpdate,
  onMultiSigTransactionSigned,
  onCloseBackup,
  onCloseRecovery,
  onCloseMultiSigSetup,
  onCloseCoSignerManagement,
  onCloseMultiSigSigner,
  onClosePerformanceMonitor,
}) => {
  return (
    <>
      {showWalletBackup && (
        <div className="modal-overlay">
          <WalletBackup
            walletManager={walletManager}
            onBackupComplete={onBackupComplete}
            onCancel={onCloseBackup}
          />
        </div>
      )}

      {showWalletRecovery && (
        <div className="modal-overlay">
          <WalletRecovery
            walletManager={walletManager}
            onRecoveryComplete={onRecoveryComplete}
            onCancel={onCloseRecovery}
          />
        </div>
      )}

      {showMultiSigSetup && (
        <div className="modal-overlay">
          <MultiSigSetup
            walletManager={walletManager}
            onSetupComplete={onMultiSigSetupComplete}
            onCancel={onCloseMultiSigSetup}
          />
        </div>
      )}

      {showCoSignerManagement && (
        <div className="modal-overlay">
          <CoSignerManagement
            walletManager={walletManager}
            onUpdate={onCoSignerUpdate}
            onCancel={onCloseCoSignerManagement}
          />
        </div>
      )}

      {showMultiSigSigner && (
        <div className="modal-overlay">
          <MultiSigTransactionSigner
            walletManager={walletManager}
            transaction={currentTransaction}
            onSigned={onMultiSigTransactionSigned}
            onCancel={onCloseMultiSigSigner}
          />
        </div>
      )}

      {showPerformanceMonitor && (
        <div className="modal-overlay">
          <PerformanceMonitor walletManager={walletManager} isVisible={showPerformanceMonitor} />
          <button className="modal-close" onClick={onClosePerformanceMonitor}>
            X
          </button>
        </div>
      )}
    </>
  );
};

export default WalletActionModals;
