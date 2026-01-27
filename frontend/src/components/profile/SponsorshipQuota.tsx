import React from 'react';
import { useWalletContext } from '../../context/WalletProvider';
import './SponsorshipQuota.css';

const SponsorshipQuotaDisplay: React.FC = () => {
  const { sponsorshipQuota, isConnected } = useWalletContext();

  if (!isConnected || !sponsorshipQuota) return null;

  const percentage = (sponsorshipQuota.remaining / sponsorshipQuota.total) * 100;
  const isLow = sponsorshipQuota.remaining <= 1;

  return (
    <div className="sponsorship-quota-card">
      <div className="quota-header">
        <h3>⛽ Gas Sponsorship</h3>
        <span className={`quota-status ${isLow ? 'low' : ''}`}>
          {sponsorshipQuota.remaining} / {sponsorshipQuota.total} Free Left
        </span>
      </div>
      
      <div className="quota-progress-bar">
        <div 
          className="quota-progress-fill" 
          style={{ width: `${percentage}%`, backgroundColor: isLow ? '#e53e3e' : '#38b2ac' }}
        />
      </div>

      <div className="quota-footer">
        <p>Resets on {sponsorshipQuota.resetDate.toLocaleDateString()}</p>
        <button className="learn-more-link">How it works?</button>
      </div>
    </div>
  );
};

export default SponsorshipQuotaDisplay;
