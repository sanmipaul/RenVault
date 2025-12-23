import { useEffect } from 'react';
import { environment } from '../config/environment';
import { validateEnvironmentVariables, logEnvironmentValidation } from '../utils/env-validator';

export const useEnvironment = () => {
  useEffect(() => {
    try {
      logEnvironmentValidation();
    } catch (error) {
      console.error('Failed to validate environment:', error);
      throw error;
    }
  }, []);

  return {
    environment,
    validation: validateEnvironmentVariables(),
  };
};

export default useEnvironment;
