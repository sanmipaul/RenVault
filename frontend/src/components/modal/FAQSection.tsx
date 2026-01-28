import React, { useState } from 'react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'wallet' | 'security' | 'fees' | 'general';
}

interface FAQSectionProps {
  showCategories?: boolean;
  maxItems?: number;
  onContactSupport?: () => void;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'what-is-wallet',
    question: 'What is a crypto wallet?',
    answer:
      'A crypto wallet is software that stores your private keys and allows you to interact with blockchain networks. It\'s like a digital bank account that only you control. Your wallet doesn\'t actually store your crypto - it stores the keys that prove you own it.',
    category: 'wallet'
  },
  {
    id: 'why-connect',
    question: 'Why do I need to connect my wallet?',
    answer:
      'Connecting your wallet allows RenVault to interact with your account on the Stacks blockchain. We use it to read your address, show your balances, and request your approval for transactions. We never have access to your private keys.',
    category: 'wallet'
  },
  {
    id: 'is-it-safe',
    question: 'Is connecting my wallet safe?',
    answer:
      'Yes! Wallet connections are read-only by default. RenVault can only see your public address. Any transaction must be explicitly approved by you in your wallet. We\'re also non-custodial, meaning we never hold your funds.',
    category: 'security'
  },
  {
    id: 'what-are-fees',
    question: 'What are gas fees?',
    answer:
      'Gas fees are small payments to blockchain validators for processing transactions. On Stacks, fees are typically very low (under $0.01). RenVault will always show you the expected fee before you confirm any transaction.',
    category: 'fees'
  },
  {
    id: 'which-wallet',
    question: 'Which wallet should I use?',
    answer:
      'For desktop users, we recommend Hiro Wallet for its excellent Stacks integration. For mobile users, Xverse is the best choice. Both are free, secure, and easy to set up.',
    category: 'wallet'
  },
  {
    id: 'what-is-stacks',
    question: 'What is Stacks?',
    answer:
      'Stacks is a Bitcoin layer that enables smart contracts and decentralized applications while being secured by Bitcoin. Your funds on Stacks inherit Bitcoin\'s security - the most secure blockchain network.',
    category: 'general'
  },
  {
    id: 'can-i-disconnect',
    question: 'Can I disconnect my wallet?',
    answer:
      'Yes, you can disconnect your wallet at any time from your profile settings or directly from your wallet app. Disconnecting revokes RenVault\'s permission to see your address.',
    category: 'wallet'
  },
  {
    id: 'funds-safety',
    question: 'Are my funds safe in RenVault?',
    answer:
      'RenVault is non-custodial - we never hold your funds. Your assets are secured by audited smart contracts on the Stacks blockchain. Only you can authorize withdrawals through your wallet.',
    category: 'security'
  }
];

const FAQSection: React.FC<FAQSectionProps> = ({
  showCategories = false,
  maxItems = 5,
  onContactSupport
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'wallet', 'security', 'fees', 'general'];

  const filteredItems =
    selectedCategory === 'all'
      ? FAQ_ITEMS.slice(0, maxItems)
      : FAQ_ITEMS.filter((item) => item.category === selectedCategory).slice(0, maxItems);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'wallet':
        return 'Wallets';
      case 'security':
        return 'Security';
      case 'fees':
        return 'Fees';
      case 'general':
        return 'General';
      default:
        return 'All';
    }
  };

  return (
    <div className="renvault-faq-section">
      <div className="renvault-faq-section__header">
        <h3 className="renvault-faq-section__title">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M7 7.5c0-1.5 1.5-2.5 3-2.5s3 1 3 2.5c0 1.5-2 2-2 3.5M10 15v.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Frequently Asked Questions
        </h3>
      </div>

      {showCategories && (
        <div className="renvault-faq-section__categories">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {getCategoryLabel(category)}
            </button>
          ))}
        </div>
      )}

      <div className="renvault-faq-section__list">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`renvault-faq-item ${expandedId === item.id ? 'expanded' : ''}`}
          >
            <button
              className="renvault-faq-item__question"
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              aria-expanded={expandedId === item.id}
            >
              <span>{item.question}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className={`renvault-faq-item__icon ${expandedId === item.id ? 'rotated' : ''}`}
              >
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {expandedId === item.id && (
              <div className="renvault-faq-item__answer">
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="renvault-faq-section__footer">
        <p>Can't find what you're looking for?</p>
        <button
          className="renvault-faq-section__contact"
          onClick={onContactSupport}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M2 4l6 4 6-4M2 4v8a1 1 0 001 1h10a1 1 0 001-1V4M2 4a1 1 0 011-1h10a1 1 0 011 1"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default FAQSection;
