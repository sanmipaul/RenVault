import { toCSV, toJSON, exportTransactions } from '../services/transaction/TransactionExportService';
import { TransactionHistoryItem } from '../services/transaction/TransactionHistoryService';

const mockTxs: TransactionHistoryItem[] = [
  {
    txId: '0xabc123',
    type: 'sent',
    amount: 1500000,
    fee: 1000,
    status: 'success',
    timestamp: 1700000000,
    from: 'SP1ABC',
    to: 'SP2DEF',
    memo: 'test',
    isSponsored: false,
  },
  {
    txId: '0xdef456',
    type: 'received',
    amount: 5000000,
    fee: 800,
    status: 'success',
    timestamp: 1700000100,
    from: 'SP3GHI',
    to: 'SP1ABC',
    isSponsored: true,
  },
];

describe('toCSV', () => {
  it('produces header row as first line', () => {
    const csv = toCSV(mockTxs);
    const firstLine = csv.split('\n')[0];
    expect(firstLine).toContain('TxID');
    expect(firstLine).toContain('Amount (STX)');
    expect(firstLine).toContain('Fee (STX)');
    expect(firstLine).toContain('Sponsored');
  });

  it('produces one data row per transaction', () => {
    const lines = toCSV(mockTxs).split('\n');
    expect(lines).toHaveLength(mockTxs.length + 1); // header + rows
  });

  it('converts microSTX to STX correctly', () => {
    const csv = toCSV([mockTxs[0]]);
    expect(csv).toContain('1.500000');
  });

  it('marks sponsored transactions', () => {
    const csv = toCSV([mockTxs[1]]);
    expect(csv).toContain('Yes');
  });

  it('marks non-sponsored transactions', () => {
    const csv = toCSV([mockTxs[0]]);
    expect(csv).toContain('No');
  });

  it('escapes double-quotes in memo field', () => {
    const tx: TransactionHistoryItem = { ...mockTxs[0], memo: 'say hello' };
    const csv = toCSV([tx]);
    expect(csv).toContain('say \"\"hello\"\"');
  });

  it('returns only header for empty array', () => {
    const csv = toCSV([]);
    expect(csv.split('\n')).toHaveLength(1);
  });

  it('formats date as ISO string', () => {
    const csv = toCSV([mockTxs[0]]);
    expect(csv).toContain('2023-11-14');
  });
});

describe('toJSON', () => {
  it('returns one record per transaction', () => {
    expect(toJSON(mockTxs)).toHaveLength(mockTxs.length);
  });

  it('converts amount to STX string', () => {
    const records = toJSON([mockTxs[0]]);
    expect(records[0].amountSTX).toBe('1.500000');
  });

  it('converts fee to STX string', () => {
    const records = toJSON([mockTxs[0]]);
    expect(records[0].feeSTX).toBe('0.001000');
  });

  it('includes sponsored boolean', () => {
    const records = toJSON(mockTxs);
    expect(records[0].sponsored).toBe(false);
    expect(records[1].sponsored).toBe(true);
  });

  it('fills empty string for missing optional fields', () => {
    const tx: TransactionHistoryItem = { txId: 'x', type: 'contract_call', fee: 0, status: 'success', timestamp: 1700000000 };
    const records = toJSON([tx]);
    expect(records[0].from).toBe('');
    expect(records[0].to).toBe('');
    expect(records[0].memo).toBe('');
    expect(records[0].amountSTX).toBe('');
  });

  it('returns empty array for empty input', () => {
    expect(toJSON([])).toEqual([]);
  });
});

describe('exportTransactions', () => {
  let appendSpy: jest.SpyInstance;
  let removeSpy: jest.SpyInstance;
  let clickSpy: jest.Mock;

  beforeEach(() => {
    clickSpy = jest.fn();
    const anchor = { href: '', download: '', style: { display: '' }, click: clickSpy };
    jest.spyOn(document, 'createElement').mockReturnValue(anchor as any);
    appendSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => anchor as any);
    removeSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => anchor as any);
    (global as any).URL.createObjectURL = jest.fn(() => 'blob:mock');
    (global as any).URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('triggers a download for CSV format', () => {
    exportTransactions(mockTxs, { format: 'csv' });
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('triggers a download for JSON format', () => {
    exportTransactions(mockTxs, { format: 'json' });
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('uses provided filename', () => {
    const anchor: any = { href: '', download: '', style: { display: '' }, click: clickSpy };
    jest.spyOn(document, 'createElement').mockReturnValue(anchor);
    exportTransactions(mockTxs, { format: 'csv', filename: 'my-export.csv' });
    expect(anchor.download).toBe('my-export.csv');
  });

  it('builds filename with address prefix when address provided', () => {
    const anchor: any = { href: '', download: '', style: { display: '' }, click: clickSpy };
    jest.spyOn(document, 'createElement').mockReturnValue(anchor);
    exportTransactions(mockTxs, { format: 'json', address: 'SP1ABCDEFGH' });
    expect(anchor.download).toMatch(/^renvault-transactions-SP1ABCDE/);
    expect(anchor.download).toMatch(/.json$/);
  });
});
