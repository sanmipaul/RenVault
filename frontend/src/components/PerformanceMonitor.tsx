// PerformanceMonitor Component
import React, { useState, useEffect } from 'react';
import { WalletManager } from '../services/wallet/WalletManager';
import { WalletProviderLoader } from '../services/wallet/WalletProviderLoader';

interface PerformanceMonitorProps {
  walletManager: WalletManager;
  isVisible?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  walletManager,
  isVisible = false
}) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loaderStats, setLoaderStats] = useState<any>(null);

  useEffect(() => {
    if (isVisible) {
      updateMetrics();
      const interval = setInterval(updateMetrics, 2000);
      return () => clearInterval(interval);
    }
  }, [isVisible, walletManager]);

  const updateMetrics = () => {
    const walletMetrics = walletManager.getPerformanceMetrics();
    const loaderMetrics = WalletProviderLoader.getCacheStats();
    setMetrics(walletMetrics);
    setLoaderStats(loaderMetrics);
  };

  const clearCache = () => {
    walletManager.clearConnectionCache();
    WalletProviderLoader.clearCache();
    updateMetrics();
  };

  if (!isVisible || !metrics) {
    return null;
  }

  return (
    <div className="performance-monitor">
      <h4>⚡ Performance Metrics</h4>

      <div className="metrics-section">
        <h5>Wallet Manager</h5>
        <div className="metric">
          <span>Cached Connections:</span>
          <span>{metrics.cachedConnections}</span>
        </div>
        <div className="metric">
          <span>Loaded Providers:</span>
          <span>{metrics.loadedProviders}</span>
        </div>
        <div className="metric">
          <span>Lazy Providers:</span>
          <span>{metrics.lazyProviders}</span>
        </div>
        <div className="metric">
          <span>Active Timeouts:</span>
          <span>{metrics.activeTimeouts}</span>
        </div>
      </div>

      <div className="metrics-section">
        <h5>Provider Loader</h5>
        <div className="metric">
          <span>Cached Providers:</span>
          <span>{loaderStats.cached}</span>
        </div>
        <div className="metric">
          <span>Provider Types:</span>
          <span>{loaderStats.types.join(', ')}</span>
        </div>
      </div>

      <div className="performance-actions">
        <button onClick={clearCache} className="btn btn-secondary">
          Clear Cache
        </button>
        <button onClick={updateMetrics} className="btn btn-outline">
          Refresh
        </button>
      </div>
    </div>
  );
};