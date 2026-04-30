import { isValidHttpsUrl } from './urlValidator';

export interface ChainConfig {
  id: string;
  name: string;
  network: string;
  chains: string[];
  methods: string[];
  events: string[];
  rpcUrl?: string;
  explorerUrl?: string;
}

export interface ChainValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateChainConfig = (config: ChainConfig): boolean => {
  return validateChainConfigDetailed(config).valid;
};

export const validateChainConfigDetailed = (config: ChainConfig): ChainValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config.id) errors.push('Chain id is required');
  if (!config.name) errors.push('Chain name is required');
  if (!config.network) errors.push('Chain network is required');
  if (!config.chains?.length) errors.push('At least one chain identifier is required');
  if (!config.methods?.length) errors.push('At least one method is required');
  if (!config.events?.length) errors.push('At least one event is required');

  if (config.rpcUrl) {
    if (!isValidHttpsUrl(config.rpcUrl)) {
      errors.push('Chain rpcUrl must be a valid HTTPS URL');
    }
  } else {
    warnings.push('No rpcUrl configured for chain');
  }

  if (config.explorerUrl && !isValidHttpsUrl(config.explorerUrl)) {
    errors.push('Chain explorerUrl must be a valid HTTPS URL');
  }

  return { valid: errors.length === 0, errors, warnings };
};

export const validateChainId = (chainId: string): boolean => {
  return /^[a-z]+:\d+$/.test(chainId);
};
