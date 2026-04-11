// components/AuthModals.tsx
// Renders 2FA and backup code modals for the unauthenticated (login) screen.
import React from 'react';
import { TwoFactorAuthSetup } from './TwoFactorAuthSetup';
import { TwoFactorAuthVerify } from './TwoFactorAuthVerify';
import { BackupCodes } from './BackupCodes';
import { FocusTrapWrapper } from './FocusTrapWrapper';

interface AuthModalsProps {
  show2FASetup: boolean;
  show2FAVerify: boolean;
  showBackupCodes: boolean;
  on2FASetupComplete: (secret: string, backupCodes: string[]) => void;
  on2FAVerify: (code: string) => Promise<boolean>;
  onBackupCodeVerify: (code: string) => Promise<boolean>;
  onClose2FASetup: () => void;
  onClose2FAVerify: () => void;
  onUseBackup: () => void;
  onCloseBackupCodes: () => void;
}

const AuthModals: React.FC<AuthModalsProps> = ({
  show2FASetup,
  show2FAVerify,
  showBackupCodes,
  on2FASetupComplete,
  on2FAVerify,
  onBackupCodeVerify,
  onClose2FASetup,
  onClose2FAVerify,
  onUseBackup,
  onCloseBackupCodes,
}) => {
  return (
    <>
      {show2FASetup && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Two-Factor Authentication Setup">
          <FocusTrapWrapper active={show2FASetup} onEscape={onClose2FASetup}>
            <TwoFactorAuthSetup onSetupComplete={on2FASetupComplete} onCancel={onClose2FASetup} />
          </FocusTrapWrapper>
        </div>
      )}

      {show2FAVerify && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Two-Factor Authentication Verification">
          <FocusTrapWrapper active={show2FAVerify} onEscape={onClose2FAVerify}>
            <TwoFactorAuthVerify
              onVerify={on2FAVerify}
              onUseBackup={onUseBackup}
              onCancel={onClose2FAVerify}
            />
          </FocusTrapWrapper>
        </div>
      )}

      {showBackupCodes && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Backup Codes Verification">
          <FocusTrapWrapper active={showBackupCodes} onEscape={onCloseBackupCodes}>
            <BackupCodes onVerify={onBackupCodeVerify} onCancel={onCloseBackupCodes} />
          </FocusTrapWrapper>
        </div>
      )}
    </>
  );
};

export default AuthModals;
