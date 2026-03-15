/**
 * useTwoFactor
 *
 * Custom hook that encapsulates all Two-Factor Authentication state and
 * operations for the connected wallet. Wraps TwoFactorSecureStorage so
 * components never touch localStorage directly for 2FA data.
 */

import { useState, useCallback } from 'react';
import { TwoFactorSecureStorage } from '../services/security/TwoFactorSecureStorage';

interface UseTwoFactorResult {
  /** Whether 2FA is currently enabled for this device/wallet. */
  tfaEnabled: boolean;
  /** Save a new TOTP secret and backup codes after successful setup. */
  enable: (secret: string, backupCodes: string[], walletAddress: string) => Promise<void>;
  /** Remove all 2FA data and mark as disabled. */
  disable: (walletAddress?: string) => void;
  /**
   * Verify a backup code.  Consumes (removes) the code when valid so it
   * cannot be reused.  Returns true on a successful match.
   */
  verifyBackupCode: (code: string, walletAddress: string) => Promise<boolean>;
  /** Clear all 2FA data without touching the enabled flag (e.g. on logout). */
  clear: () => void;
}

const TFA_ENABLED_KEY = 'tfa-enabled';

export function useTwoFactor(): UseTwoFactorResult {
  const [tfaEnabled, setTfaEnabled] = useState<boolean>(
    () =>
      TwoFactorSecureStorage.hasSecret() ||
      localStorage.getItem(TFA_ENABLED_KEY) === 'true'
  );

  const enable = useCallback(
    async (secret: string, backupCodes: string[], walletAddress: string) => {
      await TwoFactorSecureStorage.saveSecret(secret, walletAddress);
      await TwoFactorSecureStorage.saveBackupCodes(backupCodes, walletAddress);
      localStorage.setItem(TFA_ENABLED_KEY, 'true');
      setTfaEnabled(true);
    },
    []
  );

  const disable = useCallback(() => {
    TwoFactorSecureStorage.clearAll();
    localStorage.removeItem(TFA_ENABLED_KEY);
    setTfaEnabled(false);
  }, []);

  const verifyBackupCode = useCallback(
    async (code: string, walletAddress: string): Promise<boolean> => {
      return TwoFactorSecureStorage.verifyAndConsumeBackupCode(code, walletAddress);
    },
    []
  );

  const clear = useCallback(() => {
    TwoFactorSecureStorage.clearAll();
    localStorage.removeItem(TFA_ENABLED_KEY);
    setTfaEnabled(false);
  }, []);

  return { tfaEnabled, enable, disable, verifyBackupCode, clear };
}
