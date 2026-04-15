import { useState, useCallback } from 'react';
import { TransactionHistoryItem } from '../services/transaction/TransactionHistoryService';
import { TransactionHistoryService } from '../services/transaction/TransactionHistoryService';
import { exportTransactions, ExportFormat } from '../services/transaction/TransactionExportService';

export type ExportScope = 'current' | 'all';

export interface UseTransactionExportResult {
  exporting: boolean;
  exportError: string | null;
  exportCurrentPage: (transactions: TransactionHistoryItem[], format: ExportFormat, address?: string) => void;
  exportAll: (address: string, format: ExportFormat) => Promise<void>;
}

/**
 * Wraps transaction export logic. Exposes two modes:
 * - exportCurrentPage: exports whatever rows are already in memory.
 * - exportAll: fetches every page from the API then exports.
 */
export function useTransactionExport(): UseTransactionExportResult {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportCurrentPage = useCallback(
    (transactions: TransactionHistoryItem[], format: ExportFormat, address?: string) => {
      try {
        exportTransactions(transactions, { format, address });
      } catch (err) {
        setExportError(err instanceof Error ? err.message : 'Export failed');
      }
    },
    []
  );

  const exportAll = useCallback(async (address: string, format: ExportFormat) => {
    setExporting(true);
    setExportError(null);
    try {
      const service = TransactionHistoryService.getInstance();
      const PAGE = 100;
      let offset = 0;
      let all: TransactionHistoryItem[] = [];
      let total = Infinity;

      while (offset < total) {
        const result = await service.getTransactionHistory(address, PAGE, offset);
        total = result.total;
        all = all.concat(result.transactions);
        offset += PAGE;
        if (result.transactions.length === 0) break;
      }

      exportTransactions(all, { format, address });
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  }, []);

  return { exporting, exportError, exportCurrentPage, exportAll };
}
