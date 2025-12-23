import { environment } from '../config/environment';

export interface EnvironmentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateEnvironmentVariables = (): EnvironmentValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!environment.walletConnect.projectId) {
    errors.push('VITE_WALLETCONNECT_PROJECT_ID is required');
  }

  if (!environment.walletConnect.appName) {
    warnings.push('VITE_APP_NAME is not set, using default');
  }

  if (!environment.walletConnect.appUrl) {
    warnings.push('VITE_APP_URL is not set, using default');
  }

  if (
    environment.walletConnect.appUrl.startsWith('http://') &&
    environment.isProd
  ) {
    errors.push(
      'Production environment should use https URLs'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const logEnvironmentValidation = () => {
  const validation = validateEnvironmentVariables();

  if (!validation.isValid) {
    console.error('Environment Validation Errors:');
    validation.errors.forEach((error) => console.error(`  - ${error}`));
    throw new Error('Invalid environment configuration');
  }

  if (validation.warnings.length > 0) {
    console.warn('Environment Validation Warnings:');
    validation.warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  console.log('Environment validation passed');
};
