// TransactionFeeFormatter.ts
// Formats fee values for display in the UI

export class TransactionFeeFormatter {
  static toSTX(microSTX: number): string {
    return (microSTX / 1_000_000).toFixed(6).replace(/\.?0+$/, '');
  }

  static toMicroSTX(stx: number): number {
    return Math.round(stx * 1_000_000);
  }

  static isValidMicroSTX(value: number): boolean {
    return Number.isInteger(value) && value >= 0;
  }

  static formatForDisplay(microSTX: number): string {
    const stx = microSTX / 1_000_000;
    if (stx < 0.001) return `${microSTX} μSTX`;
    return `${stx.toFixed(4)} STX`;
  }

  static formatForDisplayShort(microSTX: number): string {
    const stx = microSTX / 1_000_000;
    if (stx < 0.001) return `${microSTX} μSTX`;
    if (stx < 0.01) return `${stx.toFixed(6)} STX`;
    return `${stx.toFixed(4)} STX`;
  }

  static formatRange(low: number, high: number): string {
    return `${this.formatForDisplay(low)} – ${this.formatForDisplay(high)}`;
  }

  static formatWithLabel(microSTX: number, label: string): string {
    return `${label}: ${this.formatForDisplay(microSTX)}`;
  }

  static formatEstimate(low: number, medium: number, high: number): string {
    return `Low: ${this.formatForDisplay(low)} | Medium: ${this.formatForDisplay(medium)} | High: ${this.formatForDisplay(high)}`;
  }

  static formatPercentageDiff(fee: number, estimatedFee: number): string {
    if (estimatedFee === 0) return 'N/A';
    const diff = ((fee - estimatedFee) / estimatedFee) * 100;
    const sign = diff >= 0 ? '+' : '';
    return `${sign}${diff.toFixed(1)}% vs estimate`;
  }

  static formatCongestion(congestion: number): string {
    if (congestion < 0.3) return 'Low congestion';
    if (congestion < 0.7) return 'Medium congestion';
    return 'High congestion';
  }
}
