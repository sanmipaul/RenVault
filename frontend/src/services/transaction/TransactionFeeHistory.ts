// TransactionFeeHistory.ts
// Tracks historical fee data to improve future estimates

export interface FeeRecord {
  fee: number;
  priority: 'low' | 'medium' | 'high';
  confirmedAt: number;
  txId: string;
  confirmed: boolean;
}

export class TransactionFeeHistory {
  private history: FeeRecord[] = [];
  private readonly MAX_RECORDS = 50;

  record(txId: string, fee: number, priority: 'low' | 'medium' | 'high', confirmed: boolean = true): void {
    this.history.push({ fee, priority, confirmedAt: Date.now(), txId, confirmed });
    if (this.history.length > this.MAX_RECORDS) {
      this.history.shift();
    }
  }

  getAverageFee(priority?: 'low' | 'medium' | 'high'): number {
    const records = priority ? this.history.filter(r => r.priority === priority) : this.history;
    if (records.length === 0) return 0;
    return Math.ceil(records.reduce((sum, r) => sum + r.fee, 0) / records.length);
  }

  getMinFee(priority?: 'low' | 'medium' | 'high'): number {
    const records = priority ? this.history.filter(r => r.priority === priority) : this.history;
    if (records.length === 0) return 0;
    return Math.min(...records.map(r => r.fee));
  }

  getMaxFee(priority?: 'low' | 'medium' | 'high'): number {
    const records = priority ? this.history.filter(r => r.priority === priority) : this.history;
    if (records.length === 0) return 0;
    return Math.max(...records.map(r => r.fee));
  }

  getConfirmedFees(): FeeRecord[] {
    return this.history.filter(r => r.confirmed);
  }

  getUnconfirmedFees(): FeeRecord[] {
    return this.history.filter(r => !r.confirmed);
  }

  getRecentFees(limit: number = 10): FeeRecord[] {
    return this.history.slice(-limit);
  }

  getMedianFee(priority?: 'low' | 'medium' | 'high'): number {
    const records = priority ? this.history.filter(r => r.priority === priority) : this.history;
    if (records.length === 0) return 0;
    const sorted = [...records].sort((a, b) => a.fee - b.fee);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid].fee : Math.ceil((sorted[mid - 1].fee + sorted[mid].fee) / 2);
  }

  getFeesByTimeRange(fromMs: number, toMs: number): FeeRecord[] {
    return this.history.filter(r => r.confirmedAt >= fromMs && r.confirmedAt <= toMs);
  }

  getLastFee(): FeeRecord | null {
    return this.history.length > 0 ? this.history[this.history.length - 1] : null;
  }

  hasSufficientData(minRecords: number = 5): boolean {
    return this.history.length >= minRecords;
  }

  exportToJSON(): string {
    return JSON.stringify(this.history, null, 2);
  }

  clear(): void {
    this.history = [];
  }

  size(): number {
    return this.history.length;
  }
}
