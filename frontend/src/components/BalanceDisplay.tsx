// components/BalanceDisplay.tsx
import React, { useState, useEffect } from 'react';
import { BalanceService, Balance } from '../services/balance/BalanceService';
import { useWallet } from '../hooks/useWallet';

interface BalanceDisplayProps {
  className?: string;
  showRefreshButton?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  className = '',
  showRefreshButton = true,
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  const { isConnected, connectionState, currentProvider } = useWallet();
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const balanceService = BalanceService.getInstance();

  const fetchBalance = async (showLoading = true) => {
    if (!connectionState?.address || !currentProvider) return;

    if (showLoading) setLoading(true);
    setError(null);

    try {
      const newBalance = await balanceService.getBalance(connectionState.address, currentProvider);
      setBalance(newBalance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchBalance(true);
  };

  useEffect(() => {
    if (isConnected && connectionState?.address && currentProvider) {
      fetchBalance(true);

      if (autoRefresh) {
        balanceService.startAutoRefresh(connectionState.address, currentProvider, refreshInterval);
        // Start WebSocket updates (placeholder for now)
        balanceService.startWebSocketUpdates(connectionState.address, currentProvider, (newBalance) => {
          setBalance(newBalance);
        });
      }
    } else {
      setBalance(null);
      setError(null);
    }

    return () => {
      if (connectionState?.address) {
        balanceService.stopAutoRefresh(connectionState.address);
        balanceService.stopWebSocketUpdates(connectionState.address);
      }
    };
  }, [isConnected, connectionState?.address, currentProvider, autoRefresh]);

  if (!isConnected) {
    return null;
  }

  const formatSTX = (microStx: string) => {
    const stx = parseInt(microStx) / 1000000;
    return stx.toFixed(6);
  };

  return (
    <div className={`balance-display ${className}`}>
      <h3>Wallet Balance</h3>
      {loading && (
        <div className="loading">
          <div className="balance-loading"></div>
          Loading balance...
        </div>
      )}
      {error && <div className="error">Error: {error}</div>}
      {balance && (
        <div className="balance-content">
          <div className="stx-balance">
            <span className="currency">STX</span>
            <span className="amount">{formatSTX(balance.stx)}</span>
          </div>
          {Object.keys(balance.tokens).length > 0 && (
            <div className="token-balances">
              <h4>Tokens</h4>
              {Object.entries(balance.tokens).map(([token, amount]) => (
                <div key={token} className="token-balance">
                  <span className="token-name">{token}</span>
                  <span className="token-amount">{amount}</span>
                </div>
              ))}
            </div>
          )}
          <div className="last-updated">
            Last updated: {balance.lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      )}
      {showRefreshButton && (
        <button
          className="refresh-button"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      )}
    </div>
  );
};

export default BalanceDisplay;