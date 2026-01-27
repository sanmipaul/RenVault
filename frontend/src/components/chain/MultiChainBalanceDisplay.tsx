/**
 * Multi-Chain Balance Display Component
 * Shows balances across multiple blockchain networks
 */

import React from 'react';
import { useMultiChainBalance } from '../../services/chain/MultiChainBalanceService';
import { ChainSwitchService } from '../../services/chain/ChainSwitchService';
import type { ChainType } from '../../config/multi-chain-config';

interface BalanceDisplayProps {
  address?: string;
  showAllChains?: boolean;
  compact?: boolean;
  className?: string;
  onRefresh?: () => void;
}

interface ChainBalanceDisplayProps {
  chainType: ChainType;
  balance: string | null;
  currency: string;
  loading?: boolean;
  onClick?: () => void;
}

const CHAIN_INFO: Record<
  ChainType,
  { name: string; icon: string; color: string; shortName: string }
> = {
  stacks: {
    name: 'Stacks',
    icon: '🔗',
    color: '#5546FF',
    shortName: 'STX',
  },
  'stacks-testnet': {
    name: 'Stacks Testnet',
    icon: '🧪',
    color: '#A29BFE',
    shortName: 'STX',
  },
  ethereum: {
    name: 'Ethereum',
    icon: 'Ⓔ',
    color: '#627EEA',
    shortName: 'ETH',
  },
  polygon: {
    name: 'Polygon',
    icon: '◆',
    color: '#8247E5',
    shortName: 'MATIC',
  },
  arbitrum: {
    name: 'Arbitrum',
    icon: '⚡',
    color: '#28A0F0',
    shortName: 'ARB',
  },
  sepolia: {
    name: 'Sepolia',
    icon: '🧪',
    color: '#F6ACEC',
    shortName: 'SEP',
  },
};

/**
 * Single Chain Balance Display
 */
const ChainBalanceDisplay: React.FC<ChainBalanceDisplayProps> = ({
  chainType,
  balance,
  currency,
  loading = false,
  onClick,
}) => {
  const chainInfo = CHAIN_INFO[chainType];

  return (
    <div
      className="chain-balance-card"
      onClick={onClick}
      style={{
        borderLeftColor: chainInfo.color,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div className="chain-balance-header">
        <div className="chain-balance-title">
          <span className="chain-icon">{chainInfo.icon}</span>
          <span className="chain-name">{chainInfo.shortName}</span>
        </div>
        {loading && <span className="loading-spinner">⟳</span>}
      </div>

      <div className="chain-balance-amount">
        {loading ? (
          <span className="balance-placeholder">Loading...</span>
        ) : balance ? (
          <>
            <span className="amount-value">{parseFloat(balance).toFixed(4)}</span>
            <span className="amount-currency">{currency}</span>
          </>
        ) : (
          <span className="balance-error">—</span>
        )}
      </div>

      <div className="chain-balance-network">{chainInfo.name}</div>

      <style jsx>{`
        .chain-balance-card {
          padding: 16px;
          background: white;
          border: 1px solid #E2E8F0;
          border-left: 4px solid #627EEA;
          border-radius: 8px;
          transition: all 0.2s ease;
          flex: 1;
          min-width: 160px;
        }

        .chain-balance-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .chain-balance-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .chain-balance-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #1E293B;
        }

        .chain-icon {
          font-size: 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .chain-name {
          font-size: 14px;
        }

        .loading-spinner {
          display: inline-block;
          animation: spin 1s linear infinite;
          font-size: 16px;
          color: #64748B;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .chain-balance-amount {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 8px;
        }

        .amount-value {
          font-size: 24px;
          font-weight: 700;
          color: #0F172A;
        }

        .amount-currency {
          font-size: 12px;
          font-weight: 600;
          color: #64748B;
          text-transform: uppercase;
        }

        .balance-placeholder {
          font-size: 14px;
          color: #94A3B8;
          font-style: italic;
        }

        .balance-error {
          font-size: 20px;
          color: #94A3B8;
        }

        .chain-balance-network {
          font-size: 12px;
          color: #94A3B8;
        }
      `}</style>
    </div>
  );
};

/**
 * Multi-Chain Balance Display Component
 */
export const MultiChainBalanceDisplay: React.FC<BalanceDisplayProps> = ({
  address,
  showAllChains = true,
  compact = false,
  className = '',
  onRefresh,
}) => {
  const { balances, loading, error, refetch } = useMultiChainBalance(address);
  const [activeChain, setActiveChain] = React.useState<ChainType>('ethereum');

  React.useEffect(() => {
    const chain = ChainSwitchService.getActiveChain();
    if (chain) {
      setActiveChain(chain.type);
    }

    const unsubscribe = ChainSwitchService.onChainSwitch(newChain => {
      setActiveChain(newChain.type);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRefresh = async () => {
    await refetch();
    if (onRefresh) {
      onRefresh();
    }
  };

  if (!address) {
    return (
      <div className={`balance-display-empty ${className}`}>
        <p>Connect your wallet to view balances</p>
      </div>
    );
  }

  if (compact) {
    // Compact view - show only active chain
    const activeBalance =
      activeChain === 'stacks'
        ? balances?.stacks
        : activeChain === 'ethereum'
          ? balances?.ethereum
          : activeChain === 'polygon'
            ? balances?.polygon
            : activeChain === 'arbitrum'
              ? balances?.arbitrum
              : null;

    return (
      <div className={`balance-display-compact ${className}`}>
        {activeBalance ? (
          <div className="compact-balance">
            <span className="compact-value">{activeBalance.displayBalance}</span>
            <span className="compact-currency">{activeBalance.currency}</span>
          </div>
        ) : (
          <span className="compact-loading">—</span>
        )}
      </div>
    );
  }

  // Full view - show all chains
  const chainBalances = [
    { chainType: 'stacks' as ChainType, balance: balances?.stacks },
    { chainType: 'ethereum' as ChainType, balance: balances?.ethereum },
    { chainType: 'polygon' as ChainType, balance: balances?.polygon },
    { chainType: 'arbitrum' as ChainType, balance: balances?.arbitrum },
  ];

  return (
    <div className={`balance-display-container ${className}`}>
      <div className="balance-display-header">
        <div className="balance-display-title">
          <h3>Multi-Chain Balances</h3>
          {balances && <span className="balance-total">${balances.total.toFixed(2)}</span>}
        </div>

        <div className="balance-display-actions">
          <button
            className="refresh-button"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh balances"
          >
            {loading ? '⟳' : '🔄'}
          </button>
        </div>
      </div>

      {error && <div className="balance-error-message">{error}</div>}

      <div className="balance-display-grid">
        {chainBalances.map(({ chainType, balance }) => (
          <ChainBalanceDisplay
            key={chainType}
            chainType={chainType}
            balance={balance?.displayBalance || null}
            currency={balance?.currency || CHAIN_INFO[chainType].shortName}
            loading={loading && !balance}
            onClick={() => ChainSwitchService.switchChain(chainType)}
          />
        ))}
      </div>

      {balances && (
        <div className="balance-display-footer">
          <span className="last-updated">
            Last updated: {new Date(balances.lastUpdated).toLocaleTimeString()}
          </span>
        </div>
      )}

      <style jsx>{`
        .balance-display-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 12px;
          border: 1px solid #E2E8F0;
        }

        .balance-display-empty {
          padding: 40px 20px;
          text-align: center;
          color: #64748B;
          background: white;
          border-radius: 8px;
          border: 1px dashed #CBD5E1;
        }

        .balance-display-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .balance-display-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .balance-display-title h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #0F172A;
        }

        .balance-total {
          font-size: 16px;
          font-weight: 600;
          color: #10B981;
          padding: 6px 12px;
          background-color: #ECFDF5;
          border-radius: 6px;
        }

        .balance-display-actions {
          display: flex;
          gap: 8px;
        }

        .refresh-button {
          padding: 8px 12px;
          background-color: white;
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .refresh-button:hover:not(:disabled) {
          background-color: #F1F5F9;
          border-color: #94A3B8;
        }

        .refresh-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .balance-error-message {
          padding: 12px;
          background-color: #FEE2E2;
          color: #991B1B;
          border: 1px solid #FECACA;
          border-radius: 6px;
          font-size: 13px;
        }

        .balance-display-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
        }

        .balance-display-footer {
          text-align: right;
          font-size: 12px;
          color: #94A3B8;
          padding-top: 8px;
          border-top: 1px solid #E2E8F0;
        }

        .balance-display-compact {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: white;
          border-radius: 6px;
          border: 1px solid #E2E8F0;
        }

        .compact-balance {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .compact-value {
          font-weight: 600;
          font-size: 14px;
          color: #0F172A;
        }

        .compact-currency {
          font-size: 11px;
          color: #64748B;
          text-transform: uppercase;
        }

        .compact-loading {
          font-size: 14px;
          color: #94A3B8;
        }
      `}</style>
    </div>
  );
};

export default MultiChainBalanceDisplay;
