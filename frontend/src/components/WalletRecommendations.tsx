import React from 'react';

interface WalletInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  isRecommended?: boolean;
}

const STACKS_WALLETS: WalletInfo[] = [
  {
    id: 'hiro',
    name: 'Hiro Wallet',
    description: 'The most popular wallet for Stacks users. Great browser extension.',
    icon: '🧡',
    isRecommended: true
  },
  {
    id: 'leather',
    name: 'Leather',
    description: 'Secure, multi-chain wallet for Bitcoin and Stacks.',
    icon: '💼'
  },
  {
    id: 'xverse',
    name: 'Xverse',
    description: 'Top choice for mobile users. Supports Bitcoin and Stacks.',
    icon: '🌌'
  }
];

interface WalletRecommendationsProps {
  onSelect: (id: string) => void;
}

const WalletRecommendations: React.FC<WalletRecommendationsProps> = ({ onSelect }) => {
  return (
    <div className="wallet-recommendations">
      <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#1e293b' }}>
        Recommended Stacks Wallets
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {STACKS_WALLETS.map(wallet => (
          <div 
            key={wallet.id}
            onClick={() => onSelect(wallet.id)}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              position: 'relative',
              backgroundColor: 'white'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#4a80f5'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <div style={{ fontSize: '24px' }}>{wallet.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '16px', color: '#1e293b' }}>{wallet.name}</strong>
                {wallet.isRecommended && (
                  <span style={{ 
                    fontSize: '10px', 
                    background: '#e0f2fe', 
                    color: '#0369a1', 
                    padding: '2px 8px', 
                    borderRadius: '10px',
                    fontWeight: 'bold'
                  }}>
                    RECOMMENDED
                  </span>
                )}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                {wallet.description}
              </p>
            </div>
            <div style={{ color: '#cbd5e1' }}>→</div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f1f5f9', borderRadius: '12px' }}>
        <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#475569' }}>New to Stacks?</h4>
        <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
          Stacks is a Bitcoin layer that enables smart contracts. You'll need a Stacks-compatible wallet to interact with RenVault.
        </p>
        <button style={{ 
          marginTop: '12px', 
          background: 'none', 
          border: 'none', 
          color: '#4a80f5', 
          fontSize: '12px', 
          fontWeight: '600', 
          padding: 0, 
          cursor: 'pointer' 
        }}>
          Learn how to get started →
        </button>
      </div>
    </div>
  );
};

export default WalletRecommendations;
