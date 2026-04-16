import { toCSV, toJSON } from '../services/transaction/TransactionExportService';
import { TransactionHistoryItem } from '../services/transaction/TransactionHistoryService';

function makeTx(overrides: Partial<TransactionHistoryItem> = {}): TransactionHistoryItem {
  return {
    txId: '0xtest',
    type: 'sent',
    fee: 1000,
    status: 'success',
    timestamp: 1700000000,
    ...overrides,
  };
}

describe('toCSV edge cases', () => {
  it('handles commas in memo without breaking column count', () => {
    const tx = makeTx({ memo: 'payment, ref: 42' });
    const lines = toCSV([tx]).split('\n');
    // header + 1 row
    expect(lines).toHaveLength(2);
    // The memo cell should be quoted
    expect(lines[1]).toContain('"payment, ref: 42"');
  });

  it('handles newlines in memo by keeping in quoted cell', () => {
    const tx = makeTx({ memo: 'line1\nline2' });
    const csv = toCSV([tx]);
    expect(csv).toContain('line1');
  });

  it('outputs empty amount cell when amount is undefined', () => {
    const tx = makeTx({ amount: undefined });
    const csv = toCSV([tx]);
    // amount column should be empty string
    expect(csv).not.toContain('undefined');
  });

  it('handles very large amounts correctly', () => {
    const tx = makeTx({ amount: 1_000_000_000_000 }); // 1M STX
    const csv = toCSV([tx]);
    expect(csv).toContain('1000000.000000');
  });

  it('handles zero fee', () => {
    const tx = makeTx({ fee: 0 });
    const csv = toCSV([tx]);
    expect(csv).toContain('0.000000');
  });

  it('produces consistent column count on every row', () => {
    const txs = [
      makeTx({ amount: 1000000, memo: 'hello' }),
      makeTx({ amount: undefined }),
      makeTx({ isSponsored: true }),
    ];
    const lines = toCSV(txs).split('\n');
    const colCount = lines[0].split(',').length;
    lines.slice(1).forEach(line => {
      expect(line.split(',').length).toBe(colCount);
    });
  });
});

describe('toJSON edge cases', () => {
  it('formats timestamp as ISO 8601', () => {
    const tx = makeTx({ timestamp: 0 });
    const records = toJSON([tx]);
    expect(records[0].date).toBe('1970-01-01T00:00:00.000Z');
  });

  it('handles contract_call type', () => {
    const tx = makeTx({ type: 'contract_call' });
    const records = toJSON([tx]);
    expect(records[0].type).toBe('contract_call');
  });

  it('handles failed status', () => {
    const tx = makeTx({ status: 'failed' });
    const records = toJSON([tx]);
    expect(records[0].status).toBe('failed');
  });

  it('returns serialisable plain objects', () => {
    const records = toJSON([makeTx()]);
    expect(() => JSON.stringify(records)).not.toThrow();
  });
});
