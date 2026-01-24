import React, { useState, useEffect } from 'react';
import './SponsorshipMonitoring.css';

interface SponsorshipStat {
  operation: string;
  count: number;
  totalSavings: number; // In STX
}

const SponsorshipMonitoring: React.FC = () => {
  const [stats, setStats] = useState<SponsorshipStat[]>([
    { operation: 'Deposit', count: 145, totalSavings: 2.9 },
    { operation: 'Vault Creation', count: 89, totalSavings: 4.45 },
    { operation: 'Withdrawal', count: 56, totalSavings: 1.12 }
  ]);
  const [budget, setBudget] = useState({ total: 1000, used: 8.47 });

  return (
    <div className="admin-monitoring-container">
      <h2>🛠️ Sponsorship Administration</h2>
      
      <div className="monitoring-grid">
        <div className="budget-card">
          <h3>Sponsorship Budget (STX)</h3>
          <div className="budget-progress">
            <div 
              className="progress-fill" 
              style={{ width: `${(budget.used / budget.total) * 100}%` }}
            />
          </div>
          <div className="budget-info">
            <span>Used: {budget.used} STX</span>
            <span>Total: {budget.total} STX</span>
          </div>
        </div>

        <div className="usage-table-card">
          <h3>Sponsorship by Operation</h3>
          <table className="usage-table">
            <thead>
              <tr>
                <th>Operation</th>
                <th>Count</th>
                <th>Gas Saved (STX)</th>
              </tr>
            </thead>
            <tbody>
              {stats.map(stat => (
                <tr key={stat.operation}>
                  <td>{stat.operation}</td>
                  <td>{stat.count}</td>
                  <td>{stat.totalSavings} STX</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SponsorshipMonitoring;
