import React from 'react';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: boolean;
  stats?: string;
}

interface FeatureHighlightsProps {
  showStats?: boolean;
  onFeatureClick?: (featureId: string) => void;
}

const RENVAULT_FEATURES: Feature[] = [
  {
    id: 'micro-savings',
    title: 'Secure Micro-Savings',
    description: 'Smart contract protected deposits on Bitcoin layer with guaranteed security.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="8" width="20" height="16" rx="2" stroke="#4a80f5" strokeWidth="2" />
        <path d="M4 12h20" stroke="#4a80f5" strokeWidth="2" />
        <circle cx="14" cy="18" r="2" stroke="#4a80f5" strokeWidth="2" />
        <path d="M8 8V6a6 6 0 1112 0v2" stroke="#4a80f5" strokeWidth="2" />
      </svg>
    ),
    highlight: true,
    stats: '$2.4M TVL'
  },
  {
    id: 'commitment-points',
    title: 'Earn Commitment Points',
    description: 'Get rewarded for your long-term saving habits with exclusive benefits.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <polygon
          points="14,2 17,11 26,11 19,17 22,26 14,21 6,26 9,17 2,11 11,11"
          stroke="#f59e0b"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    ),
    stats: '12,450 Points Earned'
  },
  {
    id: 'withdraw-anytime',
    title: 'Withdraw Anytime',
    description: 'Full control over your funds with no lock-in periods or hidden fees.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="10" stroke="#10b981" strokeWidth="2" />
        <path d="M14 8v6l4 2" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    stats: 'Instant Access'
  },
  {
    id: 'bitcoin-security',
    title: 'Bitcoin Security',
    description: 'Built on Stacks, secured by Bitcoin - the most secure blockchain.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="10" stroke="#f97316" strokeWidth="2" />
        <path
          d="M11 10h4c1.5 0 2.5 1 2.5 2.5S16.5 15 15 15h-4M11 15h4c1.5 0 2.5 1 2.5 2.5S16.5 20 15 20h-4M13 8v2M13 20v2M15 8v2M15 20v2"
          stroke="#f97316"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    stats: '100% Uptime'
  }
];

const FeatureHighlights: React.FC<FeatureHighlightsProps> = ({
  showStats = true,
  onFeatureClick
}) => {
  return (
    <div className="renvault-feature-highlights">
      <h4 className="renvault-feature-highlights__title">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1l2 5h5l-4 3 2 5-5-3-5 3 2-5-4-3h5l2-5z" fill="currentColor" />
        </svg>
        Why RenVault?
      </h4>

      <div className="renvault-feature-highlights__list">
        {RENVAULT_FEATURES.map((feature) => (
          <div
            key={feature.id}
            className={`renvault-feature-highlight ${feature.highlight ? 'highlighted' : ''}`}
            onClick={() => onFeatureClick?.(feature.id)}
            role="button"
            tabIndex={0}
          >
            <div className="renvault-feature-highlight__icon">{feature.icon}</div>
            <div className="renvault-feature-highlight__content">
              <h5 className="renvault-feature-highlight__title">{feature.title}</h5>
              <p className="renvault-feature-highlight__description">{feature.description}</p>
              {showStats && feature.stats && (
                <span className="renvault-feature-highlight__stats">{feature.stats}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="renvault-feature-highlights__cta">
        <a
          href="https://renvault.app/features"
          target="_blank"
          rel="noopener noreferrer"
          className="renvault-feature-highlights__link"
        >
          Explore all features
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default FeatureHighlights;
