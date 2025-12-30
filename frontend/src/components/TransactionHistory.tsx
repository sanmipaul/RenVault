// components/TransactionHistory.tsx
import React, { useState, useEffect } from 'react';
import { TransactionHistoryService, TransactionHistoryItem } from '../services/transaction/TransactionHistoryService';
import { useWallet } from '../hooks/useWallet';
import './TransactionHistory.css';

interface TransactionHistoryProps {
  address: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ address }) => {
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received' | 'contract_call'>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'amount'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const pageSize = 20;

  useEffect(() => {
    fetchTransactions();
  }, [address]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const historyService = TransactionHistoryService.getInstance();
      const result = await historyService.getTransactionHistory(address, pageSize, page * pageSize);
      setTransactions(result.transactions);
      setTotal(result.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedTransactions = transactions
    .filter(tx => {
      if (filter !== 'all' && tx.type !== filter) return false;
      if (dateFrom && tx.timestamp < new Date(dateFrom).getTime() / 1000) return false;
      if (dateTo && tx.timestamp > new Date(dateTo).getTime() / 1000) return false;
      return true;
    })
    .sort((a, b) => {
      const aValue = sortBy === 'timestamp' ? a.timestamp : a.amount || 0;
      const bValue = sortBy === 'timestamp' ? b.timestamp : b.amount || 0;
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  const formatAmount = (amount?: number) => amount ? (amount / 1000000).toFixed(6) + ' STX' : 'N/A';
  const exportToCSV = () => {
    const csvContent = [
      ['Type', 'Amount', 'Status', 'Date', 'TxID'],
      ...filteredAndSortedTransactions.map(tx => [
        tx.type,
        formatAmount(tx.amount),
        tx.status,
        formatDate(tx.timestamp),
        tx.txId,
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transaction-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div>Loading transaction history...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="transaction-history">
      <h3>Transaction History</h3>
      <button onClick={exportToCSV} className="export-btn">Export to CSV</button>
      <div className="filters">
        <label>
          Filter:
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
            <option value="all">All</option>
            <option value="sent">Sent</option>
            <option value="received">Received</option>
            <option value="contract_call">Contract Calls</option>
          </select>
        </label>
        <label>
          Sort by:
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="timestamp">Date</option>
            <option value="amount">Amount</option>
          </select>
        </label>
        <label>
          Order:
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)}>
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </label>
        <label>
          From Date:
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </label>
        <label>
          To Date:
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </label>
      </div>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
            <th>Explorer</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedTransactions.map(tx => (
            <tr key={tx.txId}>
              <td>{tx.type}</td>
              <td>{formatAmount(tx.amount)}</td>
              <td>{tx.status}</td>
              <td>{formatDate(tx.timestamp)}</td>
              <td>
                <a href={`https://explorer.stacks.co/txid/${tx.txId}`} target="_blank" rel="noopener noreferrer">
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
          Previous
        </button>
        <span>Page {page + 1} of {Math.ceil(total / pageSize)}</span>
        <button onClick={() => setPage(page + 1)} disabled={(page + 1) * pageSize >= total}>
          Next
        </button>
      </div>
    </div>
  );
};

export default TransactionHistory;