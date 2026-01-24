import React from 'react';
import './SponsoredBadge.css';

interface SponsoredBadgeProps {
  label?: string;
  tooltip?: string;
}

const SponsoredBadge: React.FC<SponsoredBadgeProps> = ({ 
  label = 'Sponsored',
  tooltip = 'Gas fee covered by RenVault'
}) => {
  return (
    <div className="sponsored-badge-container" title={tooltip}>
      <span className="sponsored-badge-icon">⛽</span>
      <span className="sponsored-badge-label">{label}</span>
      <span className="sponsored-badge-free">FREE</span>
    </div>
  );
};

export default SponsoredBadge;
