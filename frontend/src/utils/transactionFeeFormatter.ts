// TransactionFeeFormatter.ts
// Formats fee values for display in the UI

export class TransactionFeeFormatter {
  static toSTX(microSTX: number): string {
    return (microSTX / 1_000_000).toFixed(6).replace(/\.?0+$/, '');
  }

  static toMicroSTX(stx: number): number {
    return Math.round(stx * 1_000_000);
  }

  static formatForDisplay(microSTX: number): string {
    const stx = microSTX / 1_000_000;
    if (stx < 0.001) return `${microSTX} μSTX`;
    return `${stx.toFixed(4)} STX`;
  }

  static formatRange(low: number, high: number): string {
    return `${this.formatForDisplay(low)} – ${this.formatForDisplay(high)}`;
  }
}
