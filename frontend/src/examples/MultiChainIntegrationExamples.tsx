/**
 * Multi-Chain Integration Examples
 * Practical examples showing how to integrate and use multi-chain features
 */

import React from 'react';
import { ChainSwitchService, useChainSwitch } from '../services/chain/ChainSwitchService';
import { MultiChainBalanceService, useMultiChainBalance } from '../services/chain/MultiChainBalanceService';
import { MultiChainTransactionService, useMultiChainTransactions } from '../services/chain/MultiChainTransactionService';
import { MultiChainWalletProviderService, useMultiChainWallet } from '../services/chain/MultiChainWalletProviderService';
import { NetworkValidationService } from '../services/chain/NetworkValidationService';
import { ChainSelector } from './chain/ChainSelector';
import { MultiChainBalanceDisplay } from './chain/MultiChainBalanceDisplay';
import { TransactionStatus } from './chain/TransactionStatus';
import type { ChainType } from '../config/multi-chain-config';

/**
 * Example 1: Basic Chain Switching
 */
export const BasicChainSwitchingExample: React.FC = () => {
  const { activeChain, switchChain, allChains } = useChainSwitch();

  return (
    <div className="example-container">
      <h3>Basic Chain Switching</h3>

      <div className="chain-buttons">
        {allChains.map(chain => (
          <button
            key={chain.type}
            onClick={() => switchChain(chain.type)}
            className={activeChain?.type === chain.type ? 'active' : ''}
          >
            {chain.type}
          </button>
        ))}
      </div>

      <p>Current chain: {activeChain?.type}</p>
    </div>
  );
};

/**
 * Example 2: Wallet Connection and Balance Display
 */
export const WalletConnectionExample: React.FC = () => {
  const {
    wallet,
    providers,
    loading,
    connectWallet,
    disconnectWallet,
    isConnected,
    address,
  } = useMultiChainWallet();

  const { balances } = useMultiChainBalance(address || undefined);

  return (
    <div className="example-container">
      <h3>Wallet Connection & Balances</h3>

      {!isConnected ? (
        <div>
          <h4>Available Wallets:</h4>
          <div className="wallet-list">
            {providers.map(provider => (
              <button
                key={provider.name}
                onClick={() => connectWallet(provider.name)}
                disabled={loading}
              >
                {provider.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p>Connected: {address}</p>

          {balances && (
            <div className="balances">
              <h4>Balances:</h4>
              <ul>
                {balances.ethereum && <li>ETH: {balances.ethereum.displayBalance}</li>}
                {balances.polygon && <li>MATIC: {balances.polygon.displayBalance}</li>}
                {balances.arbitrum && <li>ARB: {balances.arbitrum.displayBalance}</li>}
              </ul>
            </div>
          )}

          <button onClick={disconnectWallet}>Disconnect</button>
        </div>
      )}
    </div>
  );
};

/**
 * Example 3: Multi-Chain Transaction Tracking
 */
export const TransactionTrackingExample: React.FC = () => {
  const { address } = useMultiChainWallet();
  const { transactions, statistics } = useMultiChainTransactions(address || undefined);

  return (
    <div className="example-container">
      <h3>Transaction History</h3>

      {statistics && (
        <div className="statistics">
          <p>Total Transactions: {statistics.totalTransactions}</p>
          <p>Confirmed: {statistics.confirmed}</p>
          <p>Pending: {statistics.pending}</p>
          <p>Failed: {statistics.failed}</p>
        </div>
      )}

      {transactions && transactions.length > 0 ? (
        <div className="transaction-list">
          {transactions.slice(0, 5).map(tx => (
            <div key={tx.id} className="transaction-item">
              <p>
                {tx.type} on {tx.chainType}: {tx.amount} {tx.currency}
              </p>
              <p>Status: {tx.status}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No transactions yet</p>
      )}
    </div>
  );
};

/**
 * Example 4: Address Validation
 */
export const AddressValidationExample: React.FC = () => {
  const [address, setAddress] = React.useState('');
  const [chainType, setChainType] = React.useState<ChainType>('ethereum');
  const [validation, setValidation] = React.useState<any>(null);

  const handleValidate = () => {
    const result = NetworkValidationService.validateAddress(address, chainType);
    setValidation(result);
  };

  return (
    <div className="example-container">
      <h3>Address Validation</h3>

      <div className="form-group">
        <label>
          Chain:
          <select value={chainType} onChange={e => setChainType(e.target.value as ChainType)}>
            <option value="ethereum">Ethereum</option>
            <option value="polygon">Polygon</option>
            <option value="stacks">Stacks</option>
          </select>
        </label>

        <label>
          Address:
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Enter address"
          />
        </label>

        <button onClick={handleValidate}>Validate</button>
      </div>

      {validation && (
        <div className={validation.isValid ? 'valid' : 'invalid'}>
          {validation.isValid ? (
            <p>✓ Valid address: {validation.normalizedAddress}</p>
          ) : (
            <p>✗ Invalid: {validation.error}</p>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Example 5: Complete Dashboard
 */
export const MultiChainDashboard: React.FC = () => {
  const { address, isConnected } = useMultiChainWallet();
  const { activeChain, switchChain } = useChainSwitch();
  const { balances } = useMultiChainBalance(address || undefined);

  if (!isConnected) {
    return (
      <div className="dashboard">
        <h2>Multi-Chain Dashboard</h2>
        <p>Please connect your wallet to continue</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>RenVault Multi-Chain Dashboard</h1>

        <div className="dashboard-info">
          <div className="wallet-info">
            <p>
              <strong>Wallet:</strong> {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <p>
              <strong>Chain:</strong> {activeChain?.type}
            </p>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        {/* Chain Selector */}
        <section className="dashboard-section">
          <h2>Select Chain</h2>
          <ChainSelector onChainChange={switchChain} />
        </section>

        {/* Balance Display */}
        <section className="dashboard-section">
          <h2>Multi-Chain Balances</h2>
          <MultiChainBalanceDisplay address={address} showAllChains={true} />
        </section>

        {/* Transaction History */}
        <section className="dashboard-section">
          <h2>Recent Transactions</h2>
          <TransactionStatus address={address} maxTransactions={10} />
        </section>

        {/* Chain Statistics */}
        {balances && (
          <section className="dashboard-section">
            <h2>Balance Summary</h2>
            <div className="balance-summary">
              <div className="summary-card">
                <h3>Total Balance</h3>
                <p className="summary-value">${balances.total.toFixed(2)}</p>
              </div>

              <div className="summary-card">
                <h3>Chains Connected</h3>
                <p className="summary-value">
                  {[balances.stacks, balances.ethereum, balances.polygon, balances.arbitrum].filter(
                    Boolean
                  ).length}
                </p>
              </div>

              <div className="summary-card">
                <h3>Last Updated</h3>
                <p className="summary-value">
                  {new Date(balances.lastUpdated).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <style jsx>{`
        .dashboard {
          padding: 20px;
          background: #f8fafc;
          min-height: 100vh;
        }

        .dashboard-header {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .dashboard-info {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
        }

        .wallet-info p {
          margin: 8px 0;
          color: #64748b;
        }

        .dashboard-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }

        .dashboard-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .dashboard-section h2 {
          margin-top: 0;
          margin-bottom: 16px;
          font-size: 18px;
          color: #0f172a;
        }

        .balance-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .summary-card {
          padding: 12px;
          background: #f1f5f9;
          border-radius: 6px;
        }

        .summary-card h3 {
          margin: 0 0 8px 0;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
        }

        .summary-value {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
        }
      `}</style>
    </div>
  );
};

/**
 * Example 6: Chain Operation Validation
 */
export const ChainOperationValidationExample: React.FC = () => {
  const [operation, setOperation] = React.useState<'transfer' | 'bridge' | 'swap'>('transfer');
  const [chainType, setChainType] = React.useState<ChainType>('ethereum');
  const [supportedChains, setSupportedChains] = React.useState<ChainType[]>([]);

  const handleCheck = () => {
    const compatibility = NetworkValidationService.getChainCompatibility(operation);
    setSupportedChains(compatibility[operation] || []);
  };

  return (
    <div className="example-container">
      <h3>Check Operation Support</h3>

      <div className="form-group">
        <label>
          Operation:
          <select
            value={operation}
            onChange={e => setOperation(e.target.value as any)}
          >
            <option value="transfer">Transfer</option>
            <option value="bridge">Bridge</option>
            <option value="swap">Swap</option>
          </select>
        </label>

        <button onClick={handleCheck}>Check Support</button>
      </div>

      {supportedChains.length > 0 && (
        <div>
          <h4>Supported chains for {operation}:</h4>
          <ul>
            {supportedChains.map(chain => (
              <li key={chain}>{chain}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="chain-check">
        <p>
          <strong>Current chain ({chainType}) supports {operation}:</strong>{' '}
          {NetworkValidationService.isOperationSupported(operation, chainType)
            ? '✓ Yes'
            : '✗ No'}
        </p>
      </div>
    </div>
  );
};

/**
 * Integration Examples Index
 */
export const MultiChainIntegrationExamples: React.FC = () => {
  const [activeExample, setActiveExample] = React.useState(0);

  const examples = [
    { title: 'Basic Chain Switching', component: BasicChainSwitchingExample },
    { title: 'Wallet Connection', component: WalletConnectionExample },
    { title: 'Transaction Tracking', component: TransactionTrackingExample },
    { title: 'Address Validation', component: AddressValidationExample },
    { title: 'Complete Dashboard', component: MultiChainDashboard },
    { title: 'Operation Validation', component: ChainOperationValidationExample },
  ];

  const ActiveComponent = examples[activeExample].component;

  return (
    <div className="integration-examples">
      <h1>Multi-Chain Integration Examples</h1>

      <div className="example-navigation">
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => setActiveExample(index)}
            className={activeExample === index ? 'active' : ''}
          >
            {example.title}
          </button>
        ))}
      </div>

      <div className="example-display">
        <ActiveComponent />
      </div>

      <style jsx>{`
        .integration-examples {
          padding: 20px;
          background: #f8fafc;
          min-height: 100vh;
        }

        .example-navigation {
          display: flex;
          gap: 8px;
          margin: 20px 0;
          flex-wrap: wrap;
        }

        .example-navigation button {
          padding: 8px 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .example-navigation button:hover {
          border-color: #4f46e5;
          color: #4f46e5;
        }

        .example-navigation button.active {
          background: #4f46e5;
          color: white;
          border-color: #4f46e5;
        }

        .example-display {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .example-container {
          padding: 16px;
          background: #f1f5f9;
          border-radius: 6px;
          margin: 12px 0;
        }

        .chain-buttons,
        .wallet-list {
          display: flex;
          gap: 8px;
          margin: 12px 0;
          flex-wrap: wrap;
        }

        .chain-buttons button,
        .wallet-list button {
          padding: 8px 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .chain-buttons button.active {
          background: #4f46e5;
          color: white;
          border-color: #4f46e5;
        }

        .form-group {
          margin: 12px 0;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          max-width: 300px;
          padding: 6px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
        }

        .valid {
          color: #10b981;
          padding: 8px;
          background: #ecfdf5;
          border-radius: 4px;
        }

        .invalid {
          color: #dc2626;
          padding: 8px;
          background: #fee2e2;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default MultiChainIntegrationExamples;
