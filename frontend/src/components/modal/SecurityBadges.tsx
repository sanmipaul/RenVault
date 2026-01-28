import React from 'react';

interface SecurityBadge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  verified: boolean;
}

interface SecurityBadgesProps {
  showAll?: boolean;
  onBadgeClick?: (badgeId: string) => void;
}

const SECURITY_BADGES: SecurityBadge[] = [
  {
    id: 'audit',
    title: 'Smart Contract Audited',
    description: 'Verified by independent security researchers',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
          stroke="#10b981"
          strokeWidth="2"
          fill="none"
        />
        <path d="M9 12l2 2 4-4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    verified: true
  },
  {
    id: 'noncustodial',
    title: 'Non-Custodial',
    description: 'Your keys, your funds. We never hold your assets',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="11" width="14" height="10" rx="2" stroke="#4a80f5" strokeWidth="2" />
        <path d="M8 11V7a4 4 0 118 0v4" stroke="#4a80f5" strokeWidth="2" />
        <circle cx="12" cy="16" r="1.5" fill="#4a80f5" />
      </svg>
    ),
    verified: true
  },
  {
    id: 'multisig',
    title: 'Multi-Sig Security',
    description: 'Protocol protected by multiple signatures',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="3" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="6" cy="18" r="3" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="18" cy="18" r="3" stroke="#f59e0b" strokeWidth="2" />
        <path d="M12 11v3M9 15l-1.5 1.5M15 15l1.5 1.5" stroke="#f59e0b" strokeWidth="2" />
      </svg>
    ),
    verified: true
  },
  {
    id: 'opensource',
    title: 'Open Source',
    description: 'Fully transparent and verifiable code',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.66-.21.66-.47v-1.85c-2.78.6-3.37-1.18-3.37-1.18-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.58 9.58 0 0112 6.8c.85 0 1.71.11 2.51.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.16.58.67.48A10.01 10.01 0 0022 12c0-5.52-4.48-10-10-10z"
          fill="#6366f1"
        />
      </svg>
    ),
    verified: true
  }
];

const SecurityBadges: React.FC<SecurityBadgesProps> = ({
  showAll = false,
  onBadgeClick
}) => {
  const badgesToShow = showAll ? SECURITY_BADGES : SECURITY_BADGES.slice(0, 3);

  return (
    <div className="renvault-security-badges">
      <h4 className="renvault-security-badges__title">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 1L2 4v3.5c0 3.7 2.56 7.16 6 8 3.44-.84 6-4.3 6-8V4L8 1z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        Security Certifications
      </h4>

      <div className="renvault-security-badges__list">
        {badgesToShow.map((badge) => (
          <div
            key={badge.id}
            className="renvault-security-badge"
            onClick={() => onBadgeClick?.(badge.id)}
            role="button"
            tabIndex={0}
          >
            <div className="renvault-security-badge__icon">{badge.icon}</div>
            <div className="renvault-security-badge__content">
              <div className="renvault-security-badge__header">
                <span className="renvault-security-badge__title">{badge.title}</span>
                {badge.verified && (
                  <span className="renvault-security-badge__verified">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="6" fill="#10b981" />
                      <path d="M4 6l1.5 1.5 3-3" stroke="white" strokeWidth="1.5" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="renvault-security-badge__description">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="renvault-security-badges__footer">
        <a
          href="https://renvault.app/security"
          target="_blank"
          rel="noopener noreferrer"
          className="renvault-security-badges__link"
        >
          Learn more about our security
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 9l6-6M4 3h5v5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default SecurityBadges;
