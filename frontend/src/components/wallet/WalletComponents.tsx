/**
 * Wallet-Specific UI Components
 * React components for wallet selection, installation, and connection
 */

import React, { ReactNode } from 'react';
import { WalletInstallationLinksService } from './WalletInstallationLinksService';
import { WalletMetadataService } from './WalletMetadataService';
import { WalletInstallationDetector } from './WalletInstallationDetector';

/**
 * WalletSelector Component
 * Displays available wallets for user selection
 */
export const WalletSelector: React.FC<{
  onSelect: (walletId: string) => void;
  installed?: boolean;
  recommended?: boolean;
  showIcons?: boolean;
  className?: string;
}> = ({
  onSelect,
  installed = true,
  recommended = false,
  showIcons = true,
  className = '',
}) => {
  const metadata = WalletMetadataService.getAllWalletMetadata();
  
  let wallets = installed
    ? metadata.filter(w => w.isInstalled)
    : recommended
    ? WalletMetadataService.getRecommendedWallets({ mostPopular: true })
    : metadata;

  if (wallets.length === 0) {
    return (
      <div className={`wallet-selector-empty ${className}`}>
        <p>No wallets available. Please install a wallet first.</p>
      </div>
    );
  }

  return (
    <div className={`wallet-selector ${className}`}>
      {wallets.map(wallet => (
        <button
          key={wallet.id}
          onClick={() => onSelect(wallet.id)}
          className="wallet-selector-item"
          title={wallet.description}
        >
          {showIcons && (
            <img
              src={wallet.imageUrl}
              alt={wallet.name}
              className="wallet-selector-icon"
            />
          )}
          <div className="wallet-selector-info">
            <h4>{wallet.name}</h4>
            {wallet.description && (
              <p className="wallet-selector-description">{wallet.description}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

/**
 * WalletInstallationPrompt Component
 * Prompts user to install uninstalled wallet
 */
export const WalletInstallationPrompt: React.FC<{
  walletId: string;
  onClose?: () => void;
  className?: string;
}> = ({ walletId, onClose, className = '' }) => {
  const links = WalletInstallationLinksService.getInstallationLink(walletId);

  if (links.isInstalled) {
    return null;
  }

  const handleInstall = () => {
    WalletInstallationLinksService.trackInstallationClick(walletId, 'prompt');
    window.open(links.downloadUrl || links.installationUrl, '_blank');
  };

  return (
    <div className={`wallet-installation-prompt ${className}`}>
      <div className="prompt-content">
        <img
          src={links.walletIcon}
          alt={links.walletName}
          className="prompt-icon"
        />
        <h3>Install {links.walletName}</h3>
        <p>{links.walletDescription || `${links.walletName} is required to interact with RenVault.`}</p>
        
        {links.installationSteps && links.installationSteps.length > 0 && (
          <div className="installation-steps">
            <h4>Installation Steps:</h4>
            <ol>
              {links.installationSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        <div className="prompt-actions">
          <button onClick={handleInstall} className="btn-install">
            Get {links.walletName}
          </button>
          {onClose && (
            <button onClick={onClose} className="btn-cancel">
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * WalletStatus Component
 * Displays current wallet connection status
 */
export const WalletStatus: React.FC<{
  isConnected: boolean;
  walletId: string | null;
  address: string | null;
  className?: string;
}> = ({ isConnected, walletId, address, className = '' }) => {
  const metadata = walletId ? WalletMetadataService.getWalletMetadata(walletId) : null;

  return (
    <div className={`wallet-status ${className}`}>
      <div className="status-indicator">
        <span className={`indicator-dot ${isConnected ? 'connected' : 'disconnected'}`} />
        <span className="status-text">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {isConnected && metadata && (
        <div className="wallet-info">
          <img src={metadata.imageUrl} alt={metadata.name} className="wallet-icon-small" />
          <div className="wallet-details">
            <h4>{metadata.name}</h4>
            {address && (
              <p className="wallet-address">
                {address.substring(0, 6)}...{address.substring(address.length - 4)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * WalletCompatibilityMatrix Component
 * Shows wallet compatibility with different platforms
 */
export const WalletCompatibilityMatrix: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  const matrix = WalletMetadataService.getCompatibilityMatrix();
  const wallets = Object.keys(matrix);
  const platforms = wallets.length > 0 ? Object.keys(matrix[wallets[0]]) : [];

  return (
    <div className={`compatibility-matrix ${className}`}>
      <table>
        <thead>
          <tr>
            <th>Wallet</th>
            {platforms.map(platform => (
              <th key={platform}>{platform}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {wallets.map(walletId => (
            <tr key={walletId}>
              <td className="wallet-name">
                {WalletMetadataService.getWalletMetadata(walletId)?.name}
              </td>
              {platforms.map(platform => (
                <td key={`${walletId}-${platform}`} className="compatibility-cell">
                  <span className={matrix[walletId][platform] ? 'supported' : 'unsupported'}>
                    {matrix[walletId][platform] ? '✓' : '✗'}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * WalletList Component
 * Displays list of wallets with options
 */
export const WalletList: React.FC<{
  onConnect?: (walletId: string) => void;
  onInstall?: (walletId: string) => void;
  className?: string;
}> = ({ onConnect, onInstall, className = '' }) => {
  const allWallets = WalletMetadataService.getAllWalletMetadata();

  return (
    <div className={`wallet-list ${className}`}>
      {allWallets.map(wallet => (
        <div key={wallet.id} className="wallet-list-item">
          <div className="wallet-item-content">
            <img src={wallet.imageUrl} alt={wallet.name} className="wallet-list-icon" />
            <div className="wallet-item-info">
              <h4>{wallet.name}</h4>
              <p className="wallet-description">{wallet.description}</p>
              <div className="wallet-badges">
                {wallet.isInstalled && <span className="badge installed">Installed</span>}
                {wallet.verificationStatus === 'verified' && (
                  <span className="badge verified">Verified</span>
                )}
              </div>
            </div>
          </div>

          <div className="wallet-item-actions">
            {wallet.isInstalled && onConnect ? (
              <button onClick={() => onConnect(wallet.id)} className="btn-connect">
                Connect
              </button>
            ) : !wallet.isInstalled && onInstall ? (
              <button onClick={() => onInstall(wallet.id)} className="btn-install-small">
                Install
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * WalletErrorBoundary Component
 * Error boundary for wallet-related errors
 */
export const WalletErrorBoundary: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}> = ({ children, fallback, onError }) => {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.toLowerCase().includes('wallet')) {
        setError(event.error || new Error(event.message));
        onError?.(event.error || new Error(event.message));
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [onError]);

  if (error) {
    return (
      fallback || (
        <div className="wallet-error-boundary">
          <h3>Wallet Error</h3>
          <p>{error.message}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )
    );
  }

  return <>{children}</>;
};

/**
 * WalletStatsPanel Component
 * Displays wallet connection statistics
 */
export const WalletStatsPanel: React.FC<{
  walletId?: string;
  className?: string;
}> = ({ walletId, className = '' }) => {
  const metadata = walletId
    ? WalletMetadataService.getWalletMetadata(walletId)
    : null;

  if (!metadata || !metadata.stats) {
    return null;
  }

  const stats = metadata.stats;
  const successRate = stats.connectionAttempts > 0
    ? ((stats.successfulConnections / stats.connectionAttempts) * 100).toFixed(1)
    : 'N/A';

  return (
    <div className={`wallet-stats-panel ${className}`}>
      <h4>{metadata.name} Statistics</h4>
      <div className="stats-grid">
        <div className="stat-item">
          <label>Total Attempts</label>
          <span>{stats.connectionAttempts}</span>
        </div>
        <div className="stat-item">
          <label>Successful</label>
          <span>{stats.successfulConnections}</span>
        </div>
        <div className="stat-item">
          <label>Success Rate</label>
          <span>{successRate}%</span>
        </div>
        <div className="stat-item">
          <label>Avg. Time</label>
          <span>{stats.averageConnectionTime}ms</span>
        </div>
      </div>
    </div>
  );
};

/**
 * CSS Styles for wallet components
 */
export const walletComponentStyles = `
.wallet-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.wallet-selector-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.wallet-selector-item:hover {
  border-color: #4a80f5;
  box-shadow: 0 2px 8px rgba(74, 128, 245, 0.1);
}

.wallet-selector-icon {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.wallet-status {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f5f5f5;
  border-radius: 6px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.indicator-dot.connected {
  background: #4caf50;
}

.indicator-dot.disconnected {
  background: #f44336;
}

.wallet-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wallet-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}

.wallet-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.wallet-list-icon {
  width: 32px;
  height: 32px;
  border-radius: 4px;
}

.wallet-badges {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.badge {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 3px;
  background: #e8f0fe;
  color: #4a80f5;
}

.compatibility-matrix {
  overflow-x: auto;
}

.compatibility-matrix table {
  width: 100%;
  border-collapse: collapse;
}

.compatibility-matrix th,
.compatibility-matrix td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.compatibility-matrix th {
  background: #f5f5f5;
  font-weight: 600;
}

.compatibility-cell {
  text-align: center;
}

.compatibility-cell .supported {
  color: #4caf50;
  font-weight: bold;
}

.compatibility-cell .unsupported {
  color: #ccc;
}
`;
