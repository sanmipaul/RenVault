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
import { FocusTrapWrapper } from './FocusTrapWrapper';

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
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Wallet Backup">
          <FocusTrapWrapper active={showWalletBackup} onEscape={onCloseBackup}>
            <WalletBackup
              walletManager={walletManager}
              onBackupComplete={onBackupComplete}
              onCancel={onCloseBackup}
            />
          </FocusTrapWrapper>
        </div>
      )}

      {showWalletRecovery && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Wallet Recovery">
          <FocusTrapWrapper active={showWalletRecovery} onEscape={onCloseRecovery}>
            <WalletRecovery
              walletManager={walletManager}
              onRecoveryComplete={onRecoveryComplete}
              onCancel={onCloseRecovery}
            />
          </FocusTrapWrapper>
        </div>
      )}

      {showMultiSigSetup && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="MultiSig Setup">
          <FocusTrapWrapper active={showMultiSigSetup} onEscape={onCloseMultiSigSetup}>
            <MultiSigSetup
              walletManager={walletManager}
              onSetupComplete={onMultiSigSetupComplete}
              onCancel={onCloseMultiSigSetup}
            />
          </FocusTrapWrapper>
        </div>
      )}

      {showCoSignerManagement && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Co-Signer Management">
          <FocusTrapWrapper active={showCoSignerManagement} onEscape={onCloseCoSignerManagement}>
            <CoSignerManagement
              walletManager={walletManager}
              onUpdate={onCoSignerUpdate}
              onCancel={onCloseCoSignerManagement}
            />
          </FocusTrapWrapper>
        </div>
      )}

      {showMultiSigSigner && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="MultiSig Transaction Signer">
          <FocusTrapWrapper active={showMultiSigSigner} onEscape={onCloseMultiSigSigner}>
            <MultiSigTransactionSigner
              walletManager={walletManager}
              transaction={currentTransaction}
              onSigned={onMultiSigTransactionSigned}
              onCancel={onCloseMultiSigSigner}
            />
          </FocusTrapWrapper>
        </div>
      )}

      {showPerformanceMonitor && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Performance Monitor">
          <FocusTrapWrapper active={showPerformanceMonitor} onEscape={onClosePerformanceMonitor}>
            <PerformanceMonitor walletManager={walletManager} isVisible={showPerformanceMonitor} />
            <button className="modal-close" onClick={onClosePerformanceMonitor} aria-label="Close performance monitor">
              ✕
            </button>
          </FocusTrapWrapper>
        </div>
      )}
    </>
  );
};

export default WalletActionModals;
