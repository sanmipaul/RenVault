import React, { useState, useRef, useEffect } from 'react';

interface TooltipContent {
  id: string;
  title: string;
  content: string;
  category: 'wallet' | 'security' | 'stacks' | 'general';
  learnMoreUrl?: string;
}

interface EducationalTooltipProps {
  tooltipId: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TooltipProviderProps {
  children: React.ReactNode;
}

const TOOLTIP_CONTENT: Record<string, TooltipContent> = {
  'what-is-wallet': {
    id: 'what-is-wallet',
    title: 'What is a Wallet?',
    content:
      'A crypto wallet is software that stores your private keys and lets you interact with blockchain networks. Think of it as your digital bank account that you fully control.',
    category: 'wallet',
    learnMoreUrl: 'https://renvault.app/learn/wallets'
  },
  'why-connect': {
    id: 'why-connect',
    title: 'Why Connect a Wallet?',
    content:
      'Connecting your wallet allows RenVault to read your address and request transaction signatures. We never have access to your private keys or funds.',
    category: 'wallet',
    learnMoreUrl: 'https://renvault.app/learn/connecting'
  },
  'stacks-network': {
    id: 'stacks-network',
    title: 'What is Stacks?',
    content:
      'Stacks is a Bitcoin layer that enables smart contracts and decentralized apps while inheriting Bitcoin\'s security. Your funds are secured by the Bitcoin network.',
    category: 'stacks',
    learnMoreUrl: 'https://stacks.co'
  },
  'gas-fees': {
    id: 'gas-fees',
    title: 'Understanding Gas Fees',
    content:
      'Gas fees are small transaction costs paid to network validators. Stacks fees are typically much lower than Ethereum, usually under $0.01.',
    category: 'general'
  },
  'non-custodial': {
    id: 'non-custodial',
    title: 'Non-Custodial Means Safe',
    content:
      'RenVault is non-custodial, meaning we never hold your funds. Your assets are controlled by smart contracts that only you can authorize.',
    category: 'security'
  },
  'smart-contracts': {
    id: 'smart-contracts',
    title: 'Smart Contract Security',
    content:
      'Smart contracts are self-executing programs on the blockchain. RenVault\'s contracts are audited and open source for full transparency.',
    category: 'security'
  },
  'hiro-wallet': {
    id: 'hiro-wallet',
    title: 'About Hiro Wallet',
    content:
      'Hiro Wallet is the most popular Stacks wallet. It\'s a browser extension that makes it easy to interact with Stacks apps like RenVault.',
    category: 'wallet'
  },
  'leather-wallet': {
    id: 'leather-wallet',
    title: 'About Leather Wallet',
    content:
      'Leather (formerly Hiro) is a privacy-focused wallet supporting Bitcoin and Stacks. It\'s great for users who want more control.',
    category: 'wallet'
  },
  'xverse-wallet': {
    id: 'xverse-wallet',
    title: 'About Xverse Wallet',
    content:
      'Xverse is the leading mobile wallet for Bitcoin and Stacks. Perfect for users who prefer managing their funds on the go.',
    category: 'wallet'
  }
};

export const EducationalTooltip: React.FC<EducationalTooltipProps> = ({
  tooltipId,
  children,
  position = 'top'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const tooltip = TOOLTIP_CONTENT[tooltipId];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  if (!tooltip) {
    return <>{children}</>;
  }

  const getCategoryColor = () => {
    switch (tooltip.category) {
      case 'wallet':
        return '#4a80f5';
      case 'security':
        return '#10b981';
      case 'stacks':
        return '#f97316';
      case 'general':
        return '#8b5cf6';
      default:
        return '#64748b';
    }
  };

  return (
    <div className="renvault-tooltip-container">
      <div
        ref={triggerRef}
        className="renvault-tooltip-trigger"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`renvault-tooltip renvault-tooltip--${position}`}
        >
          <div className="renvault-tooltip__header">
            <span
              className="renvault-tooltip__category"
              style={{ backgroundColor: getCategoryColor() }}
            >
              {tooltip.category}
            </span>
            <h5 className="renvault-tooltip__title">{tooltip.title}</h5>
          </div>
          <p className="renvault-tooltip__content">{tooltip.content}</p>
          {tooltip.learnMoreUrl && (
            <a
              href={tooltip.learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="renvault-tooltip__link"
            >
              Learn more
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 8l6-6M3 2h5v5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </a>
          )}
          <div className={`renvault-tooltip__arrow renvault-tooltip__arrow--${position}`} />
        </div>
      )}
    </div>
  );
};

export const TooltipProvider: React.FC<TooltipProviderProps> = ({ children }) => {
  return <div className="renvault-tooltip-provider">{children}</div>;
};

export const InfoIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 14 14"
    fill="none"
    className="renvault-info-icon"
  >
    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 6v4M7 4.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default EducationalTooltip;
