export class WalletSecurityValidator {
  private trustedDomains = ['renvault.app', 'localhost'];
  private suspiciousPatterns = ['phishing', 'scam', 'fake'];

  validateConnection(walletAddress: string, origin: string): boolean {
    if (!this.isValidAddress(walletAddress)) return false;
    if (!this.isTrustedOrigin(origin)) return false;
    return true;
  }

  isValidAddress(address: string): boolean {
    return address.startsWith('SP') || address.startsWith('ST');
  }

  isTrustedOrigin(origin: string): boolean {
    try {
      const url = new URL(origin);
      return this.trustedDomains.some(domain => url.hostname.includes(domain));
    } catch {
      return false;
    }
  }

  checkSuspiciousActivity(url: string): boolean {
    const lower = url.toLowerCase();
    return this.suspiciousPatterns.some(pattern => lower.includes(pattern));
  }

  validateTransaction(tx: any): {valid: boolean; warnings: string[]} {
    const warnings: string[] = [];

    if (!tx.amount || tx.amount <= 0) {
      warnings.push('Invalid transaction amount');
    }

    if (!tx.recipient || !this.isValidAddress(tx.recipient)) {
      warnings.push('Invalid recipient address');
    }

    if (tx.amount > 1000000) {
      warnings.push('Large transaction amount detected');
    }

    return {
      valid: warnings.length === 0,
      warnings
    };
  }

  addTrustedDomain(domain: string) {
    if (!this.trustedDomains.includes(domain)) {
      this.trustedDomains.push(domain);
    }
  }

  removeTrustedDomain(domain: string) {
    this.trustedDomains = this.trustedDomains.filter(d => d !== domain);
  }
}

export const securityValidator = new WalletSecurityValidator();
