import { exportTransactions } from '../services/transaction/TransactionExportService';
import { TransactionHistoryItem } from '../services/transaction/TransactionHistoryService';

const tx: TransactionHistoryItem = {
  txId: '0xfff',
  type: 'sent',
  fee: 500,
  status: 'success',
  timestamp: 1700000000,
};

describe('exportTransactions filename generation', () => {
  let anchor: any;
  let clickSpy: jest.Mock;

  beforeEach(() => {
    clickSpy = jest.fn();
    anchor = { href: '', download: '', style: { display: '' }, click: clickSpy };
    jest.spyOn(document, 'createElement').mockReturnValue(anchor);
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => anchor);
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => anchor);
    (global as any).URL.createObjectURL = jest.fn(() => 'blob:x');
    (global as any).URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => jest.restoreAllMocks());

  it('uses today date in generated filename', () => {
    exportTransactions([tx], { format: 'csv' });
    const today = new Date().toISOString().slice(0, 10);
    expect(anchor.download).toContain(today);
  });

  it('includes .csv extension for csv format', () => {
    exportTransactions([tx], { format: 'csv' });
    expect(anchor.download).toMatch(/.csv$/);
  });

  it('includes .json extension for json format', () => {
    exportTransactions([tx], { format: 'json' });
    expect(anchor.download).toMatch(/.json$/);
  });

  it('uses custom filename when provided', () => {
    exportTransactions([tx], { format: 'csv', filename: 'custom.csv' });
    expect(anchor.download).toBe('custom.csv');
  });

  it('includes address prefix when address provided', () => {
    exportTransactions([tx], { format: 'json', address: 'SP1HELLO' });
    expect(anchor.download).toContain('SP1HELLO');
  });
});
