/**
 * Transaction Status Tracking Component
 * Displays transaction status with chain-specific explorer links
 */

import React from 'react';
import { MultiChainTransactionService } from '../../services/chain/MultiChainTransactionService';
import { ChainSwitchService } from '../../services/chain/ChainSwitchService';
import type { ChainType } from '../../config/multi-chain-config';

interface TransactionStatusProps {
  address?: string;
  showAll?: boolean;
  className?: string;
  maxTransactions?: number;
}

interface TransactionDisplayItem {
  id: string;
  chainType: ChainType;
  type: string;
  from: string;
  to: string;
  amount: string;
  status: 'pending' | 'confirmed' | 'failed';
  hash?: string;
  timestamp: number;
  currency: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  pending: {
    bg: '#FEF3C7',
    text: '#92400E',
    icon: '⏱️',
  },
  confirmed: {
    bg: '#ECFDF5',
    text: '#065F46',
    icon: '✓',
  },
  failed: {
    bg: '#FEE2E2',
    text: '#991B1B',
    icon: '✗',
  },
};

const CHAIN_EXPLORERS: Record<ChainType, string> = {
  stacks: 'https://explorer.stacks.co',
  'stacks-testnet': 'https://testnet-explorer.stacks.co',
  ethereum: 'https://etherscan.io',
  polygon: 'https://polygonscan.com',
  arbitrum: 'https://arbiscan.io',
  sepolia: 'https://sepolia.etherscan.io',
};

/**
 * Single Transaction Item
 */
const TransactionItem: React.FC<{
  transaction: TransactionDisplayItem;
  onExplorerClick: (chainType: ChainType, hash: string) => void;
}> = ({ transaction, onExplorerClick }) => {
  const statusColor = STATUS_COLORS[transaction.status];
  const isStacks = transaction.chainType.startsWith('stacks');

  const shortHash =
    transaction.hash ? `${transaction.hash.slice(0, 6)}...${transaction.hash.slice(-4)}` : '—';

  const displayFrom = `${transaction.from.slice(0, 6)}...${transaction.from.slice(-4)}`;
  const displayTo = `${transaction.to.slice(0, 6)}...${transaction.to.slice(-4)}`;

  const timeAgo = getTimeAgo(transaction.timestamp);

  const handleExplorerClick = () => {
    if (transaction.hash) {
      onExplorerClick(transaction.chainType, transaction.hash);
    }
  };

  return (
    <div className="transaction-item">
      <div className="transaction-main">
        <div className="transaction-header">
          <div className="transaction-info">
            <div className="transaction-type">
              {transaction.type === 'transfer' ? '📤' : '🔄'}
              <span className="type-label">
                {transaction.type === 'transfer' ? 'Transfer' : 'Swap'}
              </span>
            </div>

            <div className="transaction-addresses">
              <span className="address-from">{displayFrom}</span>
              <span className="address-arrow">→</span>
              <span className="address-to">{displayTo}</span>
            </div>
          </div>

          <div className="transaction-amount">
            <span className="amount-value">{parseFloat(transaction.amount).toFixed(4)}</span>
            <span className="amount-currency">{transaction.currency}</span>
          </div>
        </div>

        <div className="transaction-meta">
          <div className="meta-chain">
            {isStacks ? '🔗' : '⟠'} {transaction.chainType}
          </div>

          <div className="meta-hash">
            {transaction.hash ? (
              <button
                className="hash-link"
                onClick={handleExplorerClick}
                title={`View on ${transaction.chainType} explorer`}
              >
                {shortHash}
                <span className="link-icon">↗</span>
              </button>
            ) : (
              <span className="hash-placeholder">—</span>
            )}
          </div>

          <div className="meta-time">{timeAgo}</div>
        </div>
      </div>

      <div
        className={`transaction-status status-${transaction.status}`}
        style={{
          backgroundColor: statusColor.bg,
          color: statusColor.text,
        }}
      >
        <span className="status-icon">{statusColor.icon}</span>
        <span className="status-text">
          {transaction.status === 'pending'
            ? 'Pending'
            : transaction.status === 'confirmed'
              ? 'Confirmed'
              : 'Failed'}
        </span>
      </div>
    </div>
  );
};

/**
 * Transaction Status Component
 */
export const TransactionStatus: React.FC<TransactionStatusProps> = ({
  address,
  showAll = false,
  className = '',
  maxTransactions = 10,
}) => {
  const [transactions, setTransactions] = React.useState<TransactionDisplayItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [filter, setFilter] = React.useState<'all' | 'pending' | 'confirmed' | 'failed'>('all');

  React.useEffect(() => {
    if (!address) return;

    // Fetch initial transactions
    const allTransactions = MultiChainTransactionService.getTransactionsByAddress(address);

    const displayTransactions: TransactionDisplayItem[] = allTransactions
      .slice(0, maxTransactions)
      .map(tx => ({
        id: tx.id,
        chainType: tx.chainType,
        type: tx.type,
        from: tx.from,
        to: tx.to,
        amount: tx.amount,
        status: tx.status,
        hash: tx.hash,
        timestamp: tx.timestamp,
        currency: tx.currency,
      }));

    setTransactions(displayTransactions);

    // Subscribe to transaction updates
    const unsubscribe = MultiChainTransactionService.onTransactionUpdate?.(() => {
      const updated = MultiChainTransactionService.getTransactionsByAddress(address)
        .slice(0, maxTransactions)
        .map(tx => ({
          id: tx.id,
          chainType: tx.chainType,
          type: tx.type,
          from: tx.from,
          to: tx.to,
          amount: tx.amount,
          status: tx.status,
          hash: tx.hash,
          timestamp: tx.timestamp,
          currency: tx.currency,
        }));

      setTransactions(updated);
    });

    return () => {
      unsubscribe?.();
    };
  }, [address, maxTransactions]);

  const filteredTransactions =
    filter === 'all'
      ? transactions
      : transactions.filter(tx => tx.status === filter);

  const handleExplorerClick = (chainType: ChainType, hash: string) => {
    const explorer = CHAIN_EXPLORERS[chainType];

    if (explorer) {
      const isStacks = chainType.startsWith('stacks');
      const txPath = isStacks ? '/tx/' : '/tx/';
      const url = `${explorer}${txPath}${hash}`;

      window.open(url, '_blank');
    }
  };

  const pendingCount = transactions.filter(tx => tx.status === 'pending').length;
  const confirmedCount = transactions.filter(tx => tx.status === 'confirmed').length;
  const failedCount = transactions.filter(tx => tx.status === 'failed').length;

  if (!address) {
    return (
      <div className={`tx-status-empty ${className}`}>
        <p>Connect your wallet to view transactions</p>
      </div>
    );
  }

  return (
    <div className={`transaction-status-container ${className}`}>
      <div className="tx-status-header">
        <div className="tx-status-title">
          <h3>Recent Transactions</h3>
          <span className="tx-count">{transactions.length}</span>
        </div>

        <div className="tx-status-filters">
          <button
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>

          {pendingCount > 0 && (
            <button
              className={`filter-button ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({pendingCount})
            </button>
          )}

          {confirmedCount > 0 && (
            <button
              className={`filter-button ${filter === 'confirmed' ? 'active' : ''}`}
              onClick={() => setFilter('confirmed')}
            >
              Confirmed ({confirmedCount})
            </button>
          )}

          {failedCount > 0 && (
            <button
              className={`filter-button ${filter === 'failed' ? 'active' : ''}`}
              onClick={() => setFilter('failed')}
            >
              Failed ({failedCount})
            </button>
          )}
        </div>
      </div>

      {loading && <div className="tx-status-loading">Loading transactions...</div>}

      {filteredTransactions.length === 0 ? (
        <div className="tx-status-empty-filtered">
          {filter === 'all'
            ? 'No transactions yet'
            : `No ${filter} transactions`}
        </div>
      ) : (
        <div className="transaction-list">
          {filteredTransactions.map(tx => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              onExplorerClick={handleExplorerClick}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .transaction-status-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px;
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
        }

        .tx-status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .tx-status-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .tx-status-title h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #0F172A;
        }

        .tx-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 28px;
          padding: 0 8px;
          background-color: #E0E7FF;
          color: #4F46E5;
          border-radius: 14px;
          font-size: 12px;
          font-weight: 600;
        }

        .tx-status-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-button {
          padding: 6px 12px;
          background: transparent;
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          color: #64748B;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-button:hover {
          background-color: #F1F5F9;
          border-color: #94A3B8;
        }

        .filter-button.active {
          background-color: #4F46E5;
          color: white;
          border-color: #4F46E5;
        }

        .tx-status-loading {
          text-align: center;
          padding: 20px;
          color: #64748B;
        }

        .tx-status-empty,
        .tx-status-empty-filtered {
          text-align: center;
          padding: 30px 20px;
          color: #94A3B8;
          background: #F8FAFC;
          border-radius: 8px;
          border: 1px dashed #CBD5E1;
        }

        .transaction-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .transaction-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #F8FAFC;
          border-radius: 8px;
          border: 1px solid #E2E8F0;
          transition: all 0.2s ease;
        }

        .transaction-item:hover {
          background: white;
          border-color: #CBD5E1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .transaction-main {
          flex: 1;
        }

        .transaction-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 8px;
        }

        .transaction-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .transaction-type {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          color: #1E293B;
          font-size: 14px;
        }

        .type-label {
          display: none;
        }

        @media (min-width: 600px) {
          .type-label {
            display: inline;
          }
        }

        .transaction-addresses {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #64748B;
          font-family: monospace;
        }

        .address-arrow {
          color: #94A3B8;
        }

        .transaction-amount {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .amount-value {
          font-size: 16px;
          font-weight: 700;
          color: #0F172A;
        }

        .amount-currency {
          font-size: 12px;
          color: #64748B;
          text-transform: uppercase;
        }

        .transaction-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #64748B;
        }

        .meta-chain,
        .meta-hash,
        .meta-time {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .hash-link {
          background: none;
          border: none;
          color: #4F46E5;
          cursor: pointer;
          font-family: monospace;
          font-size: 12px;
          text-decoration: none;
          padding: 0;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: color 0.2s;
        }

        .hash-link:hover {
          color: #6366F1;
          text-decoration: underline;
        }

        .link-icon {
          font-size: 10px;
        }

        .hash-placeholder {
          color: #CBD5E1;
        }

        .transaction-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          margin-left: 12px;
          white-space: nowrap;
        }

        .status-icon {
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .transaction-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .transaction-header {
            width: 100%;
          }

          .transaction-amount {
            align-self: flex-end;
          }

          .transaction-meta {
            width: 100%;
            flex-wrap: wrap;
          }

          .transaction-status {
            align-self: flex-end;
            margin-left: 0;
            margin-top: 8px;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Helper function to format time ago
 */
function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default TransactionStatus;
