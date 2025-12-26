// Privacy-Respecting Analytics Component
import React, { useState, useEffect } from 'react';
import './Analytics.css';

interface AnalyticsProps {
  userId?: string;
}

export const Analytics: React.FC<AnalyticsProps> = ({ userId }) => {
  const [stats, setStats] = useState<any>(null);
  const [walletStats, setWalletStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [optOut, setOptOut] = useState(false);

  useEffect(() => {
    if (optOut) return;
    fetchStats();
  }, [optOut]);

  const fetchStats = async () => {
    try {
      const [statsRes, walletRes] = await Promise.all([
        fetch('http://localhost:3001/api/stats'),
        fetch('http://localhost:3001/api/wallet-stats')
      ]);
      const statsData = await statsRes.json();
      const walletData = await walletRes.json();
      setStats(statsData);
      setWalletStats(walletData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptOut = () => {
    setOptOut(true);
    localStorage.setItem('analytics-opt-out', 'true');
  };

  if (optOut) {
    return (
      <div className="analytics-opt-out">
        <p>Analytics tracking is disabled.</p>
        <button onClick={() => { setOptOut(false); localStorage.removeItem('analytics-opt-out'); }}>
          Re-enable Analytics
        </button>
      </div>
    );
  }

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div className="analytics-dashboard">
      <h3>📊 Usage Analytics</h3>
      <p className="privacy-note">
        All data is aggregated and anonymized. No personal information is stored.
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Users</h4>
          <p>{stats?.totalUsers || 0}</p>
        </div>
        <div className="stat-card">
          <h4>Deposits</h4>
          <p>{stats?.depositCount || 0}</p>
        </div>
        <div className="stat-card">
          <h4>Withdrawals</h4>
          <p>{stats?.withdrawalCount || 0}</p>
        </div>
        <div className="stat-card">
          <h4>Wallet Connections</h4>
          <p>{walletStats?.totalConnections || 0}</p>
        </div>
        <div className="stat-card">
          <h4>Success Rate</h4>
          <p>{walletStats?.successRate || 0}%</p>
        </div>
        <div className="stat-card">
          <h4>Avg Performance</h4>
          <p>{stats?.averagePerformance ? `${stats.averagePerformance.toFixed(2)}ms` : 'N/A'}</p>
        </div>
      </div>

      <div className="analytics-actions">
        <button onClick={fetchStats} className="btn btn-secondary">
          Refresh Stats
        </button>
        <button onClick={handleOptOut} className="btn btn-outline">
          Opt Out of Analytics
        </button>
      </div>
    </div>
  );
};