// components/AuthModals.tsx
// Renders 2FA and backup code modals for the unauthenticated (login) screen.
import React from 'react';
import { TwoFactorAuthSetup } from './TwoFactorAuthSetup';
import { TwoFactorAuthVerify } from './TwoFactorAuthVerify';
import { BackupCodes } from './BackupCodes';

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
        <div className="modal-overlay">
          <TwoFactorAuthSetup onSetupComplete={on2FASetupComplete} onCancel={onClose2FASetup} />
        </div>
      )}

      {show2FAVerify && (
        <div className="modal-overlay">
          <TwoFactorAuthVerify
            onVerify={on2FAVerify}
            onUseBackup={onUseBackup}
            onCancel={onClose2FAVerify}
          />
        </div>
      )}

      {showBackupCodes && (
        <div className="modal-overlay">
          <BackupCodes onVerify={onBackupCodeVerify} onCancel={onCloseBackupCodes} />
        </div>
      )}
    </>
  );
};

export default AuthModals;
