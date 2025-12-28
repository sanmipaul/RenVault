/**
 * Analytics Dashboard Component
 * Displays analytics metrics and insights
 */

import React, { useState, useEffect } from 'react';
import { DashboardData, WalletMetrics, PerformanceMetrics } from '../types/analytics';

interface AnalyticsDashboardProps {
  data?: DashboardData;
  loading?: boolean;
  error?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  data,
  loading = false,
  error,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [activeTab, setActiveTab] = useState<'overview' | 'wallets' | 'transactions' | 'funnel'>(
    'overview'
  );

  if (loading) {
    return <div className="analytics-dashboard loading">Loading analytics...</div>;
  }

  if (error) {
    return <div className="analytics-dashboard error">Error: {error}</div>;
  }

  if (!data) {
    return <div className="analytics-dashboard empty">No analytics data available</div>;
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h1>Analytics Dashboard</h1>
        <div className="period-selector">
          <button
            className={selectedPeriod === 'day' ? 'active' : ''}
            onClick={() => setSelectedPeriod('day')}
          >
            Day
          </button>
          <button
            className={selectedPeriod === 'week' ? 'active' : ''}
            onClick={() => setSelectedPeriod('week')}
          >
            Week
          </button>
          <button
            className={selectedPeriod === 'month' ? 'active' : ''}
            onClick={() => setSelectedPeriod('month')}
          >
            Month
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'wallets' ? 'active' : ''}
          onClick={() => setActiveTab('wallets')}
        >
          Wallet Metrics
        </button>
        <button
          className={activeTab === 'transactions' ? 'active' : ''}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button
          className={activeTab === 'funnel' ? 'active' : ''}
          onClick={() => setActiveTab('funnel')}
        >
          Funnel
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && <OverviewTab data={data} />}
        {activeTab === 'wallets' && <WalletsTab wallets={data.walletMetrics} />}
        {activeTab === 'transactions' && (
          <TransactionsTab analytics={data.transactionAnalytics} />
        )}
        {activeTab === 'funnel' && <FunnelTab funnel={data.connectionFunnel} />}
      </div>
    </div>
  );
};

const OverviewTab: React.FC<{ data: DashboardData }> = ({ data }) => {
  return (
    <div className="overview-tab">
      <div className="metrics-grid">
        <MetricCard
          title="Daily Active Users"
          value={data.summary.dailyActiveUsers}
          subtext="Unique wallets connected"
        />
        <MetricCard
          title="Total Transactions"
          value={data.summary.totalTransactions}
          subtext="All transaction types"
        />
        <MetricCard
          title="Total Volume"
          value={`$${(data.summary.totalVolume / 1000000).toFixed(2)}M`}
          subtext="USD equivalent"
        />
        <MetricCard
          title="Success Rate"
          value={`${(data.summary.connectionSuccessRate * 100).toFixed(2)}%`}
          subtext="Connection success rate"
        />
      </div>
    </div>
  );
};

const WalletsTab: React.FC<{ wallets: WalletMetrics[] }> = ({ wallets }) => {
  return (
    <div className="wallets-tab">
      <table className="wallets-table">
        <thead>
          <tr>
            <th>Wallet Type</th>
            <th>Connections</th>
            <th>Success Rate</th>
            <th>Avg Connection Time</th>
            <th>Abandonment Rate</th>
          </tr>
        </thead>
        <tbody>
          {wallets.map((wallet) => (
            <tr key={wallet.walletType}>
              <td className="wallet-name">{wallet.walletType}</td>
              <td>{wallet.connectionCount}</td>
              <td>{(wallet.successRate * 100).toFixed(2)}%</td>
              <td>{wallet.averageConnectionTime.toFixed(2)}ms</td>
              <td>{(wallet.abandonmentRate * 100).toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TransactionsTab: React.FC<{ analytics: any }> = ({ analytics }) => {
  return (
    <div className="transactions-tab">
      <div className="transaction-stats-grid">
        <TransactionStat
          label="Total Transactions"
          value={analytics.totalTransactions}
        />
        <TransactionStat
          label="Successful"
          value={analytics.successfulTransactions}
        />
        <TransactionStat
          label="Failed"
          value={analytics.failedTransactions}
        />
        <TransactionStat
          label="Success Rate"
          value={`${(analytics.successRate * 100).toFixed(2)}%`}
        />
      </div>
    </div>
  );
};

const FunnelTab: React.FC<{ funnel: any }> = ({ funnel }) => {
  return (
    <div className="funnel-tab">
      <h3>Connection Funnel</h3>
      <div className="funnel-chart">
        {[funnel.initiation, funnel.walletSelection, funnel.walletAuthorization, funnel.confirmation, funnel.completion].map(
          (step) => (
            <div key={step.stepName} className="funnel-step">
              <div className="step-label">{step.stepName}</div>
              <div className="step-rate">
                {(step.completionRate * 100).toFixed(2)}% completion rate
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

// Helper Components
const MetricCard: React.FC<{ title: string; value: any; subtext: string }> = ({
  title,
  value,
  subtext,
}) => (
  <div className="metric-card">
    <h4>{title}</h4>
    <div className="metric-value">{value}</div>
    <p className="metric-subtext">{subtext}</p>
  </div>
);

const TransactionStat: React.FC<{ label: string; value: any }> = ({ label, value }) => (
  <div className="transaction-stat">
    <span className="stat-label">{label}</span>
    <span className="stat-value">{value}</span>
  </div>
);

export default AnalyticsDashboard;
