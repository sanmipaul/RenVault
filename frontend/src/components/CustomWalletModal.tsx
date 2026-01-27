import React, { useEffect, useState } from 'react';
import { useAppKit } from '@reown/appkit/react';
import WalletRecommendations from './WalletRecommendations';
import OnboardingGuide from './OnboardingGuide';
import '../styles/modal.css';

interface CustomWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CustomWalletModal: React.FC<CustomWalletModalProps> = ({ isOpen, onClose }) => {
  const { open } = useAppKit();
  const [networkStatus, setNetworkStatus] = useState<'online' | 'congested' | 'offline'>('online');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleWalletSelect = (id: string) => {
    // In a real implementation, we might trigger a specific wallet connection
    // For now, we open the main AppKit modal
    open();
    onClose();
  };

  return (
    <div className="custom-modal-overlay" onClick={onClose}>
      <div className="custom-modal-container" onClick={e => e.stopPropagation()}>
        <div className="custom-modal-main">
          <div className="modal-header">
            <div className="logo-section">
              <h2>RenVault 🏦</h2>
              <p className="tagline">Connect to Your Secure Stacks Vault</p>
            </div>
            <button className="close-button" onClick={onClose}>&times;</button>
          </div>

          <div className="network-status-container" style={{ marginBottom: '24px' }}>
            <div className="network-status">
              <span className="status-indicator"></span>
              Stacks Mainnet: <strong>{networkStatus.toUpperCase()}</strong>
            </div>
          </div>

          <WalletRecommendations onSelect={handleWalletSelect} />
          
          <div style={{ marginTop: 'auto', paddingTop: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
              By connecting, you agree to our 
              <a href="https://renvault.app/terms" style={{ color: '#4a80f5', margin: '0 4px' }}>Terms</a> 
              and 
              <a href="https://renvault.app/privacy" style={{ color: '#4a80f5', margin: '0 4px' }}>Privacy Policy</a>
            </p>
          </div>
        </div>

        <div className="custom-modal-sidebar">
          <div className="sidebar-section">
            <OnboardingGuide />
          </div>

          <div className="sidebar-section">
            <h3 style={{ fontSize: '14px', color: '#64748b', textTransform: 'uppercase', marginBottom: '16px' }}>
              RenVault Features
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="feature-item">
                <span className="feature-icon">🛡️</span>
                <div className="feature-content">
                  <h4>Secure micro-savings</h4>
                  <p>Smart contract protected deposits on Bitcoin layer.</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💎</span>
                <div className="feature-content">
                  <h4>Earn commitment points</h4>
                  <p>Get rewarded for your long-term saving habits.</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔓</span>
                <div className="feature-content">
                  <h4>Withdraw anytime</h4>
                  <p>Full control over your funds with no lock-in periods.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar-section" style={{ marginTop: 'auto' }}>
            <div className="security-badge">
              <span>Security Verified</span>
              <strong>Smart Contract Audited</strong>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '12px', textAlign: 'center' }}>
              RenVault uses multi-sig security and is non-custodial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomWalletModal;
