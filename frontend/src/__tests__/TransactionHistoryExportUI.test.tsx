import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import * as ExportHook from '../hooks/useTransactionExport';

// Minimal mock for TransactionHistoryService
jest.mock('../services/transaction/TransactionHistoryService', () => ({
  TransactionHistoryService: {
    getInstance: () => ({
      getTransactionHistory: jest.fn().mockResolvedValue({ transactions: [], total: 0 }),
    }),
  },
}));

// Mock SponsoredBadge
jest.mock('../components/common/SponsoredBadge', () => () => null);

const mockExportHook = {
  exporting: false,
  exportError: null,
  exportCurrentPage: jest.fn(),
  exportAll: jest.fn(),
};

describe('TransactionHistory export toolbar', () => {
  beforeEach(() => {
    jest.spyOn(ExportHook, 'useTransactionExport').mockReturnValue(mockExportHook);
    mockExportHook.exportCurrentPage.mockClear();
    mockExportHook.exportAll.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders four export buttons', async () => {
    const TransactionHistory = (await import('../components/TransactionHistory')).default;
    render(<TransactionHistory address="SP1TEST" />);
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
    expect(screen.getByText('Export JSON')).toBeInTheDocument();
    expect(screen.getByText('Export All (CSV)')).toBeInTheDocument();
    expect(screen.getByText('Export All (JSON)')).toBeInTheDocument();
  });

  it('calls exportAll with csv when Export All CSV clicked', async () => {
    const TransactionHistory = (await import('../components/TransactionHistory')).default;
    render(<TransactionHistory address="SP1TEST" />);
    fireEvent.click(screen.getByText('Export All (CSV)'));
    expect(mockExportHook.exportAll).toHaveBeenCalledWith('SP1TEST', 'csv');
  });

  it('calls exportAll with json when Export All JSON clicked', async () => {
    const TransactionHistory = (await import('../components/TransactionHistory')).default;
    render(<TransactionHistory address="SP1TEST" />);
    fireEvent.click(screen.getByText('Export All (JSON)'));
    expect(mockExportHook.exportAll).toHaveBeenCalledWith('SP1TEST', 'json');
  });

  it('shows export error when exportError is set', async () => {
    jest.spyOn(ExportHook, 'useTransactionExport').mockReturnValue({
      ...mockExportHook,
      exportError: 'Network failed',
    });
    const TransactionHistory = (await import('../components/TransactionHistory')).default;
    render(<TransactionHistory address="SP1TEST" />);
    expect(screen.getByText('Network failed')).toBeInTheDocument();
  });

  it('disables all export buttons while exporting', async () => {
    jest.spyOn(ExportHook, 'useTransactionExport').mockReturnValue({
      ...mockExportHook,
      exporting: true,
    });
    const TransactionHistory = (await import('../components/TransactionHistory')).default;
    render(<TransactionHistory address="SP1TEST" />);
    screen.getAllByRole('button', { name: /export/i }).forEach(btn => {
      expect(btn).toBeDisabled();
    });
  });
});
