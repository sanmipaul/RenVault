export interface ChainConfig {
  id: string;
  name: string;
  network: string;
  chains: string[];
  methods: string[];
  events: string[];
}

export const validateChainConfig = (config: ChainConfig): boolean => {
  return !!(config.id && config.name && config.network && config.chains?.length > 0 && config.methods?.length > 0 && config.events?.length > 0);
};

export const validateChainId = (chainId: string): boolean => {
  return /^[a-z]+:\d+$/.test(chainId);
};
