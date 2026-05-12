// TransactionFeeReporter.ts
// Generates fee summary reports from history data

import { TransactionFeeHistory } from './TransactionFeeHistory';
import { TransactionFeeFormatter } from '../../utils/transactionFeeFormatter';

export interface FeeReport {
  averageFee: string;
  minFee: string;
  maxFee: string;
  medianFee: string;
  totalRecords: number;
  generatedAt: string;
}

export class TransactionFeeReporter {
  constructor(private history: TransactionFeeHistory) {}

  generateReport(priority?: 'low' | 'medium' | 'high'): FeeReport {
    return {
      averageFee: TransactionFeeFormatter.formatForDisplay(this.history.getAverageFee(priority)),
      minFee: TransactionFeeFormatter.formatForDisplay(this.history.getMinFee(priority)),
      maxFee: TransactionFeeFormatter.formatForDisplay(this.history.getMaxFee(priority)),
      medianFee: TransactionFeeFormatter.formatForDisplay(this.history.getMedianFee(priority)),
      totalRecords: this.history.size(),
      generatedAt: new Date().toISOString(),
    };
  }

  generateDetailedReport(): Record<'low' | 'medium' | 'high', FeeReport> {
    return {
      low: this.generateReport('low'),
      medium: this.generateReport('medium'),
      high: this.generateReport('high'),
    };
  }

  summarize(): string {
    const report = this.generateReport();
    return `Fee Summary — Avg: ${report.averageFee}, Min: ${report.minFee}, Max: ${report.maxFee} (${report.totalRecords} records)`;
  }
}
