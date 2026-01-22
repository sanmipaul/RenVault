// MultiSigWalletProvider.ts
import { WalletProvider, WalletProviderType } from '../types/wallet';

export interface CoSigner {
  address: string;
  publicKey: string;
  name?: string;
}

export interface MultiSigConfig {
  threshold: number;
  totalSigners: number;
  coSigners: CoSigner[];
  owner: string;
}

export class MultiSigWalletProvider implements WalletProvider {
  private config: MultiSigConfig | null = null;
  private pendingSignatures: Map<string, { signatures: string[], required: number }> = new Map();

  getType(): WalletProviderType {
    return 'multisig';
  }

  async connect(): Promise<any> {
    // Multi-sig doesn't connect like regular wallets
    // It manages multiple signers
    return {
      address: 'multi-sig-vault',
      publicKey: 'multi-sig-public-key'
    };
  }

  async disconnect(): Promise<void> {
    this.config = null;
    this.pendingSignatures.clear();
  }

  async signTransaction(tx: any): Promise<any> {
    if (!this.config) {
      throw new Error('Multi-sig wallet not configured');
    }

    // For multi-sig, we collect signatures instead of signing immediately
    const txId = this.generateTxId(tx);
    const existing = this.pendingSignatures.get(txId) || { signatures: [], required: this.config.threshold };

    // Add current signature (in real implementation, this would be from connected wallet)
    const signature = await this.getCurrentSignature(tx);
    if (!existing.signatures.includes(signature)) {
      existing.signatures.push(signature);
    }

    this.pendingSignatures.set(txId, existing);

    // Check if we have enough signatures
    if (existing.signatures.length >= existing.required) {
      // Combine signatures and return final transaction
      return this.combineSignatures(tx, existing.signatures);
    } else {
      // Return pending status
      return {
        status: 'pending',
        currentSignatures: existing.signatures.length,
        requiredSignatures: existing.required,
        txId
      };
    }
  }

  // Multi-sig specific methods
  setupMultiSig(config: MultiSigConfig): void {
    if (config.threshold > config.totalSigners) {
      throw new Error('Threshold cannot be greater than total signers');
    }
    if (config.threshold < 1) {
      throw new Error('Threshold must be at least 1');
    }
    this.config = config;
  }

  getConfig(): MultiSigConfig | null {
    return this.config;
  }

  addCoSigner(coSigner: CoSigner): void {
    if (!this.config) {
      throw new Error('Multi-sig wallet not configured');
    }
    if (this.config.coSigners.length >= this.config.totalSigners - 1) { // -1 for owner
      throw new Error('Maximum co-signers reached');
    }
    this.config.coSigners.push(coSigner);
  }

  removeCoSigner(address: string): void {
    if (!this.config) {
      throw new Error('Multi-sig wallet not configured');
    }
    this.config.coSigners = this.config.coSigners.filter(cs => cs.address !== address);
  }

  getPendingTransactions(): string[] {
    return Array.from(this.pendingSignatures.keys());
  }

  getTransactionStatus(txId: string): { signatures: number, required: number } | null {
    const pending = this.pendingSignatures.get(txId);
    return pending ? { signatures: pending.signatures.length, required: pending.required } : null;
  }

  private generateTxId(tx: any): string {
    // Simple hash of transaction data
    return btoa(JSON.stringify(tx)).slice(0, 16);
  }

  private async getCurrentSignature(tx: any): Promise<string> {
    // In real implementation, this would sign with current connected wallet
    // For now, return a mock signature
    return 'mock-signature-' + Date.now();
  }

  private combineSignatures(tx: any, signatures: string[]): any {
    // Combine multiple signatures into final transaction
    return {
      ...tx,
      multiSigSignatures: signatures,
      status: 'signed'
    };
  }
}