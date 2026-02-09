export interface WalletConfigValidation {
  isValid: boolean;
  errors: string[];
}

export interface WalletConfigError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export type ValidationResult = {
  valid: boolean;
  errors: WalletConfigError[];
};
