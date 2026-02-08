export class NetworkDetector {
  private currentNetwork: string = 'mainnet';
  private listeners: Set<(network: string) => void> = new Set();

  detectNetwork(): string {
    const url = window.location.hostname;
    if (url.includes('testnet') || url.includes('localhost')) {
      return 'testnet';
    }
    return 'mainnet';
  }

  getCurrentNetwork(): string {
    return this.currentNetwork;
  }

  switchNetwork(network: string) {
    if (this.currentNetwork !== network) {
      this.currentNetwork = network;
      this.notifyListeners(network);
    }
  }

  onNetworkChange(callback: (network: string) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(network: string) {
    this.listeners.forEach(listener => listener(network));
  }

  isMainnet(): boolean {
    return this.currentNetwork === 'mainnet';
  }

  isTestnet(): boolean {
    return this.currentNetwork === 'testnet';
  }

  getNetworkConfig() {
    return {
      network: this.currentNetwork,
      chainId: this.currentNetwork === 'mainnet' ? 'stacks:1' : 'stacks:2147483648',
      apiUrl: this.currentNetwork === 'mainnet' 
        ? 'https://api.mainnet.hiro.so'
        : 'https://api.testnet.hiro.so'
    };
  }
}

export const networkDetector = new NetworkDetector();
