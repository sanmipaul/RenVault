import React, { useState, useEffect } from 'react';
import { EducationalTooltip, InfoIcon } from './modal/EducationalTooltips';

interface WalletInfo {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: string;
  logoUrl: string;
  isRecommended?: boolean;
  downloadUrl: string;
  features: string[];
  platforms: string[];
  userType: 'beginner' | 'advanced' | 'all';
}

const STACKS_WALLETS: WalletInfo[] = [
  {
    id: 'hiro',
    name: 'Hiro Wallet',
    description: 'The most popular wallet for Stacks users.',
    longDescription:
      'Hiro Wallet is the go-to choice for Stacks users. It offers seamless browser integration, excellent DeFi support, and is actively maintained by the Hiro team.',
    icon: '🧡',
    logoUrl: '/wallets/hiro.svg',
    isRecommended: true,
    downloadUrl: 'https://wallet.hiro.so',
    features: ['Browser Extension', 'NFT Support', 'DeFi Ready', 'Stacks Native'],
    platforms: ['Chrome', 'Firefox'],
    userType: 'all'
  },
  {
    id: 'leather',
    name: 'Leather',
    description: 'Secure, multi-chain wallet for Bitcoin and Stacks.',
    longDescription:
      'Leather (formerly Hiro Wallet) is a privacy-focused wallet supporting both Bitcoin and Stacks. Great for users who want advanced features and multi-chain support.',
    icon: '💼',
    logoUrl: '/wallets/leather.svg',
    isRecommended: false,
    downloadUrl: 'https://leather.io',
    features: ['Multi-chain', 'Privacy Focus', 'Ordinals', 'BNS Support'],
    platforms: ['Chrome', 'Firefox', 'Desktop'],
    userType: 'advanced'
  },
  {
    id: 'xverse',
    name: 'Xverse',
    description: 'Top choice for mobile users with Bitcoin and Stacks.',
    longDescription:
      'Xverse is the leading mobile wallet for the Bitcoin ecosystem. It supports both Bitcoin and Stacks with a beautiful, user-friendly interface.',
    icon: '🌌',
    logoUrl: '/wallets/xverse.svg',
    isRecommended: true,
    downloadUrl: 'https://www.xverse.app',
    features: ['Mobile First', 'Bitcoin + Stacks', 'NFT Gallery', 'Easy Setup'],
    platforms: ['iOS', 'Android', 'Chrome'],
    userType: 'beginner'
  }
];

interface WalletRecommendationsProps {
  onSelect: (id: string) => void;
  showGetWalletLinks?: boolean;
  filterByUserType?: 'beginner' | 'advanced' | 'all';
}

const WalletRecommendations: React.FC<WalletRecommendationsProps> = ({
  onSelect,
  showGetWalletLinks = true,
  filterByUserType = 'all'
}) => {
  const [hoveredWallet, setHoveredWallet] = useState<string | null>(null);
  const [recentWallets, setRecentWallets] = useState<string[]>([]);

  useEffect(() => {
    // Load recent wallet connections from localStorage
    try {
      const stored = localStorage.getItem('renvault_recent_wallets');
      if (stored) {
        setRecentWallets(JSON.parse(stored));
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  const filteredWallets =
    filterByUserType === 'all'
      ? STACKS_WALLETS
      : STACKS_WALLETS.filter(
          (w) => w.userType === filterByUserType || w.userType === 'all'
        );

  const handleWalletSelect = (walletId: string) => {
    // Save to recent wallets
    const updated = [walletId, ...recentWallets.filter((id) => id !== walletId)].slice(0, 3);
    try {
      localStorage.setItem('renvault_recent_wallets', JSON.stringify(updated));
    } catch (e) {
      // Ignore localStorage errors
    }
    onSelect(walletId);
  };

  return (
    <div className="renvault-wallet-recommendations">
      <div className="renvault-wallet-recommendations__header">
        <h3 className="renvault-wallet-recommendations__title">
          Choose Your Wallet
          <EducationalTooltip tooltipId="why-connect" position="right">
            <InfoIcon size={16} />
          </EducationalTooltip>
        </h3>
        <p className="renvault-wallet-recommendations__subtitle">
          Select a Stacks-compatible wallet to connect to RenVault
        </p>
      </div>

      {recentWallets.length > 0 && (
        <div className="renvault-wallet-recommendations__recent">
          <span className="recent-label">Recent:</span>
          {recentWallets.map((walletId) => {
            const wallet = STACKS_WALLETS.find((w) => w.id === walletId);
            if (!wallet) return null;
            return (
              <button
                key={walletId}
                className="recent-wallet-btn"
                onClick={() => handleWalletSelect(walletId)}
              >
                <span>{wallet.icon}</span>
                {wallet.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="renvault-wallet-recommendations__list">
        {filteredWallets.map((wallet) => (
          <div
            key={wallet.id}
            className={`renvault-wallet-item ${wallet.isRecommended ? 'recommended' : ''} ${
              hoveredWallet === wallet.id ? 'hovered' : ''
            }`}
            onClick={() => handleWalletSelect(wallet.id)}
            onMouseEnter={() => setHoveredWallet(wallet.id)}
            onMouseLeave={() => setHoveredWallet(null)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleWalletSelect(wallet.id)}
          >
            <div className="renvault-wallet-item__icon">
              <img
                src={wallet.logoUrl}
                alt={wallet.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    const fallback = document.createElement('span');
                    fallback.textContent = wallet.icon;
                    fallback.style.fontSize = '28px';
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>
            <div className="renvault-wallet-item__content">
              <div className="renvault-wallet-item__header">
                <h4 className="renvault-wallet-item__name">{wallet.name}</h4>
                {wallet.isRecommended && (
                  <span className="renvault-wallet-item__badge">Recommended</span>
                )}
              </div>
              <p className="renvault-wallet-item__description">{wallet.description}</p>
              {hoveredWallet === wallet.id && (
                <div className="renvault-wallet-item__features">
                  {wallet.features.slice(0, 3).map((feature) => (
                    <span key={feature} className="feature-tag">
                      {feature}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="renvault-wallet-item__arrow">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M7 4l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {showGetWalletLinks && (
        <div className="renvault-wallet-recommendations__help">
          <div className="help-card">
            <div className="help-card__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M9 9c0-1.5 1.5-2.5 3-2.5s3 1 3 2.5c0 1.5-2 2-2 3.5M12 17v.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="help-card__content">
              <h4>New to Stacks wallets?</h4>
              <p>
                Stacks is a Bitcoin layer that enables smart contracts. You'll need a
                Stacks-compatible wallet to use RenVault.
              </p>
              <a
                href="https://renvault.app/learn/wallets"
                target="_blank"
                rel="noopener noreferrer"
                className="help-card__link"
              >
                Learn how to get started
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 11l8-8M5 3h6v6" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletRecommendations;
