// types/appkit.ts
/**
 * Type definitions for AppKit integration
 */

export interface AppKitConfig {
  projectId: string;
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
  themeMode: 'light' | 'dark';
  themeVariables: {
    '--w3m-color-mix': string;
    '--w3m-color-mix-strength': number;
  };
}

export interface StacksNetwork {
  id: string;
  name: string;
  network: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: {
    default: { http: string[] };
  };
  blockExplorers: {
    default: { name: string; url: string };
  };
}