// hooks/use2FA.ts
import { useState, useCallback } from 'react';
import { APP_CONFIG } from '../constants/app';

interface Use2FAResult {
  isEnabled: boolean;
  tfaSecret: string;
  enable: (secret: string, backupCodes: string[]) => void;
  disable: () => void;
  verifyBackupCode: (code: string) => boolean;
}

export const use2FA = (): Use2FAResult => {
  const [tfaSecret, setTfaSecret] = useState<string>('');
  const isEnabled = localStorage.getItem(APP_CONFIG.tfaEnabledKey) === 'true';

  const enable = useCallback((secret: string, backupCodes: string[]) => {
    setTfaSecret(secret);
    localStorage.setItem(APP_CONFIG.tfaEnabledKey, 'true');
    localStorage.setItem(APP_CONFIG.tfaSecretKey, secret);
    localStorage.setItem(APP_CONFIG.tfaBackupCodesKey, JSON.stringify(backupCodes));
  }, []);

  const disable = useCallback(() => {
    setTfaSecret('');
    localStorage.removeItem(APP_CONFIG.tfaEnabledKey);
    localStorage.removeItem(APP_CONFIG.tfaSecretKey);
    localStorage.removeItem(APP_CONFIG.tfaBackupCodesKey);
  }, []);

  const verifyBackupCode = useCallback((code: string): boolean => {
    try {
      const storedCodes: string[] = JSON.parse(
        localStorage.getItem(APP_CONFIG.tfaBackupCodesKey) || '[]'
      );
      if (storedCodes.includes(code)) {
        const remaining = storedCodes.filter((c) => c !== code);
        localStorage.setItem(APP_CONFIG.tfaBackupCodesKey, JSON.stringify(remaining));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return { isEnabled, tfaSecret, enable, disable, verifyBackupCode };
};
