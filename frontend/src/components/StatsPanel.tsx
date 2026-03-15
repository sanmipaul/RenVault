// components/StatsPanel.tsx
import React from 'react';
import { NetworkType } from '../types/app';

interface StatsPanelProps {
  balance: string;
  points: string;
  detectedNetwork: NetworkType | null;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ balance, points, detectedNetwork }) => {
  return (
    <div className="stats">
      <div className="stat-card">
        <div className="stat-value">{balance} STX</div>
        <div>Vault Balance</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{points}</div>
        <div>Commitment Points</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">
          {detectedNetwork ? detectedNetwork.toUpperCase() : 'Unknown'}
        </div>
        <div>Network</div>
      </div>
    </div>
  );
};

export default StatsPanel;
