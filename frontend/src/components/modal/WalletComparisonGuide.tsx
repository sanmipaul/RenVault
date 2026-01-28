import React, { useState } from 'react';

type DeviceType = 'desktop' | 'mobile';

interface WalletComparison {
  id: string;
  name: string;
  logo: string;
  description: string;
  features: string[];
  pros: string[];
  cons: string[];
  downloadUrl: string;
  platforms: ('chrome' | 'firefox' | 'ios' | 'android' | 'desktop')[];
  isRecommended: boolean;
  deviceType: DeviceType[];
}

interface WalletComparisonGuideProps {
  onWalletSelect?: (walletId: string) => void;
  initialDevice?: DeviceType;
}

const WALLET_COMPARISONS: WalletComparison[] = [
  {
    id: 'hiro',
    name: 'Hiro Wallet',
    logo: '/wallets/hiro.svg',
    description: 'The most popular wallet for Stacks users with excellent browser integration.',
    features: ['Browser Extension', 'Stacks Native', 'NFT Support', 'DeFi Ready'],
    pros: ['Easy to use', 'Best Stacks integration', 'Active development'],
    cons: ['Desktop only', 'No hardware wallet support'],
    downloadUrl: 'https://wallet.hiro.so',
    platforms: ['chrome', 'firefox'],
    isRecommended: true,
    deviceType: ['desktop']
  },
  {
    id: 'leather',
    name: 'Leather',
    logo: '/wallets/leather.svg',
    description: 'Privacy-focused wallet with multi-chain support for Bitcoin and Stacks.',
    features: ['Multi-chain', 'Privacy Focus', 'Ordinals Support', 'BNS Integration'],
    pros: ['Privacy features', 'Bitcoin + Stacks', 'Advanced features'],
    cons: ['Steeper learning curve', 'Desktop focused'],
    downloadUrl: 'https://leather.io',
    platforms: ['chrome', 'firefox', 'desktop'],
    isRecommended: false,
    deviceType: ['desktop']
  },
  {
    id: 'xverse',
    name: 'Xverse',
    logo: '/wallets/xverse.svg',
    description: 'Top mobile wallet for Bitcoin and Stacks with beautiful UX.',
    features: ['Mobile First', 'Bitcoin + Stacks', 'NFT Gallery', 'Ordinals'],
    pros: ['Best mobile experience', 'Great UI/UX', 'Active community'],
    cons: ['Mobile focused', 'Newer than alternatives'],
    downloadUrl: 'https://www.xverse.app',
    platforms: ['ios', 'android', 'chrome'],
    isRecommended: true,
    deviceType: ['mobile', 'desktop']
  }
];

const WalletComparisonGuide: React.FC<WalletComparisonGuideProps> = ({
  onWalletSelect,
  initialDevice = 'desktop'
}) => {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>(initialDevice);
  const [expandedWallet, setExpandedWallet] = useState<string | null>(null);

  const filteredWallets = WALLET_COMPARISONS.filter((wallet) =>
    wallet.deviceType.includes(selectedDevice)
  );

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'chrome':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#4285f4" strokeWidth="1.5" />
            <circle cx="8" cy="8" r="3" fill="#4285f4" />
          </svg>
        );
      case 'firefox':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#ff7139" strokeWidth="1.5" />
            <path d="M5 6c0-2 3-2 3 0s3 2 3 0" stroke="#ff7139" strokeWidth="1.5" />
          </svg>
        );
      case 'ios':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1c-2 0-3.5 1.5-3.5 3.5V5h7v-.5C11.5 2.5 10 1 8 1z" stroke="#333" strokeWidth="1.5" />
            <rect x="4" y="5" width="8" height="10" rx="1" stroke="#333" strokeWidth="1.5" />
          </svg>
        );
      case 'android':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="3" y="6" width="10" height="8" rx="1" stroke="#3ddc84" strokeWidth="1.5" />
            <path d="M5 3l1 3M11 3l-1 3" stroke="#3ddc84" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="6" cy="8" r="0.5" fill="#3ddc84" />
            <circle cx="10" cy="8" r="0.5" fill="#3ddc84" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="renvault-wallet-comparison">
      <div className="renvault-wallet-comparison__header">
        <h3 className="renvault-wallet-comparison__title">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Wallet Comparison Guide
        </h3>
        <p className="renvault-wallet-comparison__subtitle">
          Choose the best wallet for your needs
        </p>
      </div>

      <div className="renvault-wallet-comparison__device-toggle">
        <button
          className={`device-toggle-btn ${selectedDevice === 'desktop' ? 'active' : ''}`}
          onClick={() => setSelectedDevice('desktop')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="2" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 14h6M8 12v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Desktop
        </button>
        <button
          className={`device-toggle-btn ${selectedDevice === 'mobile' ? 'active' : ''}`}
          onClick={() => setSelectedDevice('mobile')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="4" y="1" width="8" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="8" cy="13" r="1" fill="currentColor" />
          </svg>
          Mobile
        </button>
      </div>

      <div className="renvault-wallet-comparison__list">
        {filteredWallets.map((wallet) => (
          <div
            key={wallet.id}
            className={`renvault-wallet-card ${wallet.isRecommended ? 'recommended' : ''} ${
              expandedWallet === wallet.id ? 'expanded' : ''
            }`}
          >
            <div
              className="renvault-wallet-card__header"
              onClick={() => setExpandedWallet(expandedWallet === wallet.id ? null : wallet.id)}
            >
              <div className="renvault-wallet-card__info">
                <img
                  src={wallet.logo}
                  alt={wallet.name}
                  className="renvault-wallet-card__logo"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="renvault-wallet-card__name-section">
                  <h4 className="renvault-wallet-card__name">
                    {wallet.name}
                    {wallet.isRecommended && (
                      <span className="renvault-wallet-card__badge">Recommended</span>
                    )}
                  </h4>
                  <p className="renvault-wallet-card__description">{wallet.description}</p>
                </div>
              </div>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className={`renvault-wallet-card__chevron ${
                  expandedWallet === wallet.id ? 'rotated' : ''
                }`}
              >
                <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            {expandedWallet === wallet.id && (
              <div className="renvault-wallet-card__details">
                <div className="renvault-wallet-card__features">
                  <h5>Features</h5>
                  <div className="feature-tags">
                    {wallet.features.map((feature) => (
                      <span key={feature} className="feature-tag">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="renvault-wallet-card__pros-cons">
                  <div className="pros">
                    <h5>Pros</h5>
                    <ul>
                      {wallet.pros.map((pro) => (
                        <li key={pro}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <circle cx="6" cy="6" r="6" fill="#10b981" />
                            <path d="M4 6l1.5 1.5 3-3" stroke="white" strokeWidth="1.5" />
                          </svg>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="cons">
                    <h5>Cons</h5>
                    <ul>
                      {wallet.cons.map((con) => (
                        <li key={con}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <circle cx="6" cy="6" r="6" fill="#f59e0b" />
                            <path d="M6 4v3M6 8.5v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="renvault-wallet-card__platforms">
                  <span>Available on:</span>
                  <div className="platform-icons">
                    {wallet.platforms.map((platform) => (
                      <span key={platform} className="platform-icon" title={platform}>
                        {getPlatformIcon(platform)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="renvault-wallet-card__actions">
                  <a
                    href={wallet.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="renvault-wallet-card__download"
                  >
                    Get {wallet.name}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 11l8-8M5 3h6v6" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </a>
                  <button
                    className="renvault-wallet-card__select"
                    onClick={() => onWalletSelect?.(wallet.id)}
                  >
                    Connect with {wallet.name}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalletComparisonGuide;
