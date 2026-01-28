import React, { useState, useEffect } from 'react';

interface NetworkInfo {
  status: 'online' | 'congested' | 'offline';
  blockHeight: number;
  avgGasPrice: string;
  txPending: number;
  lastBlock: Date;
}

interface NetworkStatusProps {
  network?: 'mainnet' | 'testnet';
  showDetails?: boolean;
  onRefresh?: () => void;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({
  network = 'mainnet',
  showDetails = true,
  onRefresh
}) => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    status: 'online',
    blockHeight: 0,
    avgGasPrice: '0.001',
    txPending: 0,
    lastBlock: new Date()
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Simulated network status fetch - in production, this would call actual APIs
    const fetchNetworkStatus = async () => {
      try {
        // Simulate API call
        setNetworkInfo({
          status: 'online',
          blockHeight: 145892,
          avgGasPrice: '0.001',
          txPending: 42,
          lastBlock: new Date()
        });
      } catch (error) {
        setNetworkInfo((prev) => ({ ...prev, status: 'offline' }));
      }
    };

    fetchNetworkStatus();
    const interval = setInterval(fetchNetworkStatus, 30000);
    return () => clearInterval(interval);
  }, [network]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onRefresh?.();
    setIsRefreshing(false);
  };

  const getStatusColor = () => {
    switch (networkInfo.status) {
      case 'online':
        return '#10b981';
      case 'congested':
        return '#f59e0b';
      case 'offline':
        return '#ef4444';
    }
  };

  const getStatusLabel = () => {
    switch (networkInfo.status) {
      case 'online':
        return 'Operational';
      case 'congested':
        return 'High Traffic';
      case 'offline':
        return 'Unavailable';
    }
  };

  const formatBlockHeight = (height: number) => {
    return height.toLocaleString();
  };

  const getTimeSinceLastBlock = () => {
    const seconds = Math.floor((Date.now() - networkInfo.lastBlock.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <div className="renvault-network-status">
      <div className="renvault-network-status__header">
        <div className="renvault-network-status__title">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="2" fill="currentColor" />
            <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" fill="none" />
          </svg>
          <span>Stacks {network === 'mainnet' ? 'Mainnet' : 'Testnet'}</span>
        </div>
        <div className="renvault-network-status__indicator">
          <span
            className="renvault-network-status__dot"
            style={{ backgroundColor: getStatusColor() }}
          />
          <span
            className="renvault-network-status__label"
            style={{ color: getStatusColor() }}
          >
            {getStatusLabel()}
          </span>
        </div>
      </div>

      {showDetails && (
        <div className="renvault-network-status__details">
          <div className="renvault-network-status__stat">
            <span className="renvault-network-status__stat-label">Block Height</span>
            <span className="renvault-network-status__stat-value">
              {formatBlockHeight(networkInfo.blockHeight)}
            </span>
          </div>
          <div className="renvault-network-status__stat">
            <span className="renvault-network-status__stat-label">Avg Gas</span>
            <span className="renvault-network-status__stat-value">
              {networkInfo.avgGasPrice} STX
            </span>
          </div>
          <div className="renvault-network-status__stat">
            <span className="renvault-network-status__stat-label">Pending TX</span>
            <span className="renvault-network-status__stat-value">{networkInfo.txPending}</span>
          </div>
          <div className="renvault-network-status__stat">
            <span className="renvault-network-status__stat-label">Last Block</span>
            <span className="renvault-network-status__stat-value">{getTimeSinceLastBlock()}</span>
          </div>
        </div>
      )}

      <button
        className={`renvault-network-status__refresh ${isRefreshing ? 'refreshing' : ''}`}
        onClick={handleRefresh}
        disabled={isRefreshing}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M1 7a6 6 0 1011.5 2.4M13 7A6 6 0 001.5 4.6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path d="M13 2v5h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M1 12V7h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </button>
    </div>
  );
};

export default NetworkStatus;
