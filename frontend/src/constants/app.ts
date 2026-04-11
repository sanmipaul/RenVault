// constants/app.ts

export const CONTRACT_ADDRESS = 'SP3ESR2PWP83R1YM3S4QJRWPDD886KJ4YFS3FKHPY';
export const CONTRACT_NAME = 'ren-vault';

export const APP_CONFIG = {
  name: 'RenVault',
  icon: window.location.origin + '/logo192.png',
  analyticsOptOutKey: 'analytics-opt-out',
  tfaEnabledKey: 'tfa-enabled',
  tfaSecretKey: 'tfa-secret',
  tfaBackupCodesKey: 'tfa-backup-codes',
} as const;
