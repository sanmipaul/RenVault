import { renderHook, act } from '@testing-library/react';
import { useTransactionExport } from '../hooks/useTransactionExport';
import * as ExportService from '../services/transaction/TransactionExportService';
import * as HistoryService from '../services/transaction/TransactionHistoryService';
import { TransactionHistoryItem } from '../services/transaction/TransactionHistoryService';

function makeTx(id: string): TransactionHistoryItem {
  return { txId: id, type: 'sent', fee: 0, status: 'success', timestamp: 1700000000 };
}

describe('useTransactionExport exportAll pagination', () => {
  beforeEach(() => {
    jest.spyOn(ExportService, 'exportTransactions').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it('fetches multiple pages until total is reached', async () => {
    const page1 = Array.from({ length: 100 }, (_, i) => makeTx(`tx-${i}`));
    const page2 = Array.from({ length: 50 }, (_, i) => makeTx(`tx-${100 + i}`));
    const mockService = {
      getTransactionHistory: jest.fn()
        .mockResolvedValueOnce({ transactions: page1, total: 150 })
        .mockResolvedValueOnce({ transactions: page2, total: 150 }),
    };
    jest.spyOn(HistoryService.TransactionHistoryService, 'getInstance').mockReturnValue(mockService as any);

    const { result } = renderHook(() => useTransactionExport());
    await act(async () => {
      await result.current.exportAll('SP1ABC', 'csv');
    });

    // Should have been called with all 150 transactions
    const [allTxs] = (ExportService.exportTransactions as jest.Mock).mock.calls[0];
    expect(allTxs).toHaveLength(150);
    expect(mockService.getTransactionHistory).toHaveBeenCalledTimes(2);
  });

  it('sets exporting=true during fetch and false after', async () => {
    let resolveFirst!: (v: any) => void;
    const pendingPromise = new Promise(r => { resolveFirst = r; });
    const mockService = {
      getTransactionHistory: jest.fn().mockReturnValueOnce(pendingPromise),
    };
    jest.spyOn(HistoryService.TransactionHistoryService, 'getInstance').mockReturnValue(mockService as any);

    const { result } = renderHook(() => useTransactionExport());

    let exportPromise!: Promise<void>;
    act(() => {
      exportPromise = result.current.exportAll('SP1ABC', 'json');
    });
    expect(result.current.exporting).toBe(true);

    await act(async () => {
      resolveFirst({ transactions: [], total: 0 });
      await exportPromise;
    });
    expect(result.current.exporting).toBe(false);
  });
});
