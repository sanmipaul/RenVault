import { renderHook, act } from '@testing-library/react';
import { useTransactionExport } from '../hooks/useTransactionExport';
import * as ExportService from '../services/transaction/TransactionExportService';
import * as HistoryService from '../services/transaction/TransactionHistoryService';
import { TransactionHistoryItem } from '../services/transaction/TransactionHistoryService';

const mockTx: TransactionHistoryItem = {
  txId: '0xaaa',
  type: 'sent',
  amount: 1000000,
  fee: 500,
  status: 'success',
  timestamp: 1700000000,
};

describe('useTransactionExport', () => {
  beforeEach(() => {
    jest.spyOn(ExportService, 'exportTransactions').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('starts with exporting=false and no error', () => {
    const { result } = renderHook(() => useTransactionExport());
    expect(result.current.exporting).toBe(false);
    expect(result.current.exportError).toBeNull();
  });

  it('exportCurrentPage calls exportTransactions with csv format', () => {
    const { result } = renderHook(() => useTransactionExport());
    act(() => {
      result.current.exportCurrentPage([mockTx], 'csv', 'SP1ABC');
    });
    expect(ExportService.exportTransactions).toHaveBeenCalledWith(
      [mockTx],
      expect.objectContaining({ format: 'csv', address: 'SP1ABC' })
    );
  });

  it('exportCurrentPage calls exportTransactions with json format', () => {
    const { result } = renderHook(() => useTransactionExport());
    act(() => {
      result.current.exportCurrentPage([mockTx], 'json');
    });
    expect(ExportService.exportTransactions).toHaveBeenCalledWith(
      [mockTx],
      expect.objectContaining({ format: 'json' })
    );
  });

  it('exportAll fetches all pages and calls exportTransactions', async () => {
    const mockService = {
      getTransactionHistory: jest.fn()
        .mockResolvedValueOnce({ transactions: [mockTx], total: 1 })
    };
    jest.spyOn(HistoryService.TransactionHistoryService, 'getInstance').mockReturnValue(mockService as any);

    const { result } = renderHook(() => useTransactionExport());
    await act(async () => {
      await result.current.exportAll('SP1ABC', 'csv');
    });

    expect(ExportService.exportTransactions).toHaveBeenCalledWith(
      [mockTx],
      expect.objectContaining({ format: 'csv', address: 'SP1ABC' })
    );
    expect(result.current.exporting).toBe(false);
  });

  it('exportAll sets exportError when fetch throws', async () => {
    const mockService = {
      getTransactionHistory: jest.fn().mockRejectedValue(new Error('network error'))
    };
    jest.spyOn(HistoryService.TransactionHistoryService, 'getInstance').mockReturnValue(mockService as any);

    const { result } = renderHook(() => useTransactionExport());
    await act(async () => {
      await result.current.exportAll('SP1ABC', 'json');
    });

    expect(result.current.exportError).toBe('network error');
    expect(result.current.exporting).toBe(false);
  });
});
