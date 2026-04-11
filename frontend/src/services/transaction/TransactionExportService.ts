import { TransactionHistoryItem } from './TransactionHistoryService';

export type ExportFormat = 'csv' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  address?: string;
}

const CSV_HEADERS = ['TxID', 'Type', 'Amount (STX)', 'Fee (STX)', 'Status', 'Date', 'From', 'To', 'Memo', 'Sponsored'];

function formatAmount(microStx?: number): string {
  return microStx != null ? (microStx / 1_000_000).toFixed(6) : '';
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString();
}

function escapeCSVCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function buildCSVRow(tx: TransactionHistoryItem): string[] {
  return [
    tx.txId,
    tx.type,
    formatAmount(tx.amount),
    formatAmount(tx.fee),
    tx.status,
    formatDate(tx.timestamp),
    tx.from ?? '',
    tx.to ?? '',
    tx.memo ?? '',
    tx.isSponsored ? 'Yes' : 'No',
  ];
}

export function toCSV(transactions: TransactionHistoryItem[]): string {
  const rows = [CSV_HEADERS, ...transactions.map(buildCSVRow)];
  return rows.map(row => row.map(cell => escapeCSVCell(String(cell))).join(',')).join('
');
}

export interface JSONExportRecord {
  txId: string;
  type: string;
  amountSTX: string;
  feeSTX: string;
  status: string;
  date: string;
  from: string;
  to: string;
  memo: string;
  sponsored: boolean;
}

export function toJSON(transactions: TransactionHistoryItem[]): JSONExportRecord[] {
  return transactions.map(tx => ({
    txId: tx.txId,
    type: tx.type,
    amountSTX: formatAmount(tx.amount),
    feeSTX: formatAmount(tx.fee),
    status: tx.status,
    date: formatDate(tx.timestamp),
    from: tx.from ?? '',
    to: tx.to ?? '',
    memo: tx.memo ?? '',
    sponsored: tx.isSponsored ?? false,
  }));
}

function buildFilename(format: ExportFormat, address?: string): string {
  const dateStr = new Date().toISOString().slice(0, 10);
  const addrSuffix = address ? `-${address.slice(0, 8)}` : '';
  return `renvault-transactions${addrSuffix}-${dateStr}.${format}`;
}

export function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function exportTransactions(
  transactions: TransactionHistoryItem[],
  options: ExportOptions
): void {
  const { format, address } = options;
  const filename = options.filename ?? buildFilename(format, address);

  if (format === 'csv') {
    triggerDownload(toCSV(transactions), filename, 'text/csv;charset=utf-8;');
  } else {
    triggerDownload(
      JSON.stringify(toJSON(transactions), null, 2),
      filename,
      'application/json'
    );
  }
}
