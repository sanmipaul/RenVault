/**
 * Chain Selector Component
 * Allows users to switch between supported blockchain networks
 */

import React, { useState } from 'react';
import { ChainSwitchService } from '../../services/chain/ChainSwitchService';
import { MultiChainBalanceService } from '../../services/chain/MultiChainBalanceService';
import type { ChainType } from '../../config/multi-chain-config';

interface ChainSelectorProps {
  onChainChange?: (chainType: ChainType) => void;
  compact?: boolean;
  className?: string;
}

interface ChainOption {
  value: ChainType;
  label: string;
  icon: string;
  color: string;
  testnet?: boolean;
}

const CHAIN_OPTIONS: ChainOption[] = [
  {
    value: 'stacks',
    label: 'Stacks',
    icon: '🔗',
    color: '#5546FF',
  },
  {
    value: 'stacks-testnet',
    label: 'Stacks Testnet',
    icon: '🧪',
    color: '#A29BFE',
    testnet: true,
  },
  {
    value: 'ethereum',
    label: 'Ethereum',
    icon: 'Ⓔ',
    color: '#627EEA',
  },
  {
    value: 'polygon',
    label: 'Polygon',
    icon: '◆',
    color: '#8247E5',
  },
  {
    value: 'arbitrum',
    label: 'Arbitrum',
    icon: '⚡',
    color: '#28A0F0',
  },
  {
    value: 'sepolia',
    label: 'Sepolia',
    icon: '🧪',
    color: '#F6ACEC',
    testnet: true,
  },
];

/**
 * ChainSelector Component
 */
export const ChainSelector: React.FC<ChainSelectorProps> = ({
  onChainChange,
  compact = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChain, setActiveChain] = React.useState<ChainType>('ethereum');
  const [loading, setLoading] = React.useState(false);

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

  const handleChainChange = async (chainType: ChainType) => {
    setLoading(true);

    try {
      await ChainSwitchService.switchChain(chainType);
      setActiveChain(chainType);
      setIsOpen(false);

      if (onChainChange) {
        onChainChange(chainType);
      }
    } catch (error) {
      console.error('Error switching chain:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentChain = CHAIN_OPTIONS.find(c => c.value === activeChain);

  if (compact) {
    return (
      <div className={`chain-selector-compact ${className}`}>
        <div className="chain-selector-button">
          <span className="chain-icon">{currentChain?.icon}</span>
          <span className="chain-name">{currentChain?.label}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`chain-selector ${className}`}>
      {/* Main Button */}
      <button
        className="chain-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        style={{
          backgroundColor: currentChain?.color || '#627EEA',
          opacity: loading ? 0.6 : 1,
        }}
      >
        <span className="chain-icon">{currentChain?.icon}</span>
        <span className="chain-label">{currentChain?.label}</span>
        <span className="chain-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="chain-selector-menu">
          <div className="chain-selector-groups">
            {/* Stacks Group */}
            <div className="chain-group">
              <h4 className="chain-group-title">Layer 1</h4>
              {CHAIN_OPTIONS.filter(c => c.value.startsWith('stacks')).map(chain => (
                <button
                  key={chain.value}
                  className={`chain-option ${activeChain === chain.value ? 'active' : ''} ${
                    chain.testnet ? 'testnet' : ''
                  }`}
                  onClick={() => handleChainChange(chain.value)}
                  disabled={loading}
                  style={{
                    borderLeftColor: chain.color,
                    backgroundColor:
                      activeChain === chain.value ? `${chain.color}20` : 'transparent',
                  }}
                >
                  <span className="option-icon">{chain.icon}</span>
                  <span className="option-label">{chain.label}</span>
                  {chain.testnet && <span className="testnet-badge">Testnet</span>}
                  {activeChain === chain.value && <span className="active-badge">✓</span>}
                </button>
              ))}
            </div>

            {/* EVM Group */}
            <div className="chain-group">
              <h4 className="chain-group-title">EVM Networks</h4>
              {CHAIN_OPTIONS.filter(
                c => !c.value.startsWith('stacks') && c.value !== 'sepolia'
              ).map(chain => (
                <button
                  key={chain.value}
                  className={`chain-option ${activeChain === chain.value ? 'active' : ''}`}
                  onClick={() => handleChainChange(chain.value)}
                  disabled={loading}
                  style={{
                    borderLeftColor: chain.color,
                    backgroundColor:
                      activeChain === chain.value ? `${chain.color}20` : 'transparent',
                  }}
                >
                  <span className="option-icon">{chain.icon}</span>
                  <span className="option-label">{chain.label}</span>
                  {activeChain === chain.value && <span className="active-badge">✓</span>}
                </button>
              ))}
            </div>

            {/* Testnet Group */}
            <div className="chain-group">
              <h4 className="chain-group-title">Testnets</h4>
              {CHAIN_OPTIONS.filter(
                c =>
                  c.testnet &&
                  c.value !== 'stacks-testnet'
              ).map(chain => (
                <button
                  key={chain.value}
                  className={`chain-option testnet ${activeChain === chain.value ? 'active' : ''}`}
                  onClick={() => handleChainChange(chain.value)}
                  disabled={loading}
                  style={{
                    borderLeftColor: chain.color,
                    backgroundColor:
                      activeChain === chain.value ? `${chain.color}20` : 'transparent',
                  }}
                >
                  <span className="option-icon">{chain.icon}</span>
                  <span className="option-label">{chain.label}</span>
                  <span className="testnet-badge">Testnet</span>
                  {activeChain === chain.value && <span className="active-badge">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .chain-selector {
          position: relative;
          display: inline-block;
          min-width: 180px;
        }

        .chain-selector-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .chain-selector-trigger:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .chain-selector-trigger:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .chain-icon {
          font-size: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
        }

        .chain-label {
          flex: 1;
          text-align: left;
        }

        .chain-arrow {
          font-size: 12px;
          transition: transform 0.3s ease;
        }

        .chain-selector-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 8px;
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          overflow: hidden;
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chain-selector-groups {
          max-height: 400px;
          overflow-y: auto;
        }

        .chain-group {
          padding: 12px 0;
          border-bottom: 1px solid #E2E8F0;
        }

        .chain-group:last-child {
          border-bottom: none;
        }

        .chain-group-title {
          margin: 0;
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 600;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .chain-option {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          background: transparent;
          border: none;
          border-left: 4px solid transparent;
          color: #1E293B;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          position: relative;
        }

        .chain-option:hover {
          background-color: #F8FAFC;
        }

        .chain-option.active {
          font-weight: 600;
        }

        .chain-option:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .option-icon {
          font-size: 18px;
          width: 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .option-label {
          flex: 1;
        }

        .testnet-badge {
          display: inline-block;
          padding: 2px 8px;
          background-color: #FEF3C7;
          color: #92400E;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .active-badge {
          font-size: 16px;
          color: #10B981;
          font-weight: bold;
        }

        .chain-selector-compact {
          display: inline-block;
        }

        .chain-selector-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background-color: #F1F5F9;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13px;
          color: #1E293B;
        }
      `}</style>
    </div>
  );
};

export default ChainSelector;
