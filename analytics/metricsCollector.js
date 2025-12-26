// Metrics Collector
const fs = require('fs');
const path = require('path');

class MetricsCollector {
  constructor() {
    this.dataFile = path.join(__dirname, 'metrics.json');
    this.metrics = this.loadMetrics();
  }

  loadMetrics() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf8');
        const parsed = JSON.parse(data);
        // Convert users back to Set
        parsed.users = new Set(parsed.users);
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
    return {
      deposits: [],
      withdrawals: [],
      users: new Set(),
      fees: 0,
      walletConnections: [],
      walletErrors: [],
      performanceMetrics: []
    };
  }

  saveMetrics() {
    try {
      const data = { ...this.metrics, users: Array.from(this.metrics.users) };
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }

  recordDeposit(user, amount, timestamp) {
    this.metrics.deposits.push({ user, amount, timestamp });
    this.metrics.users.add(user);
    this.saveMetrics();
  }

  recordWithdrawal(user, amount, timestamp) {
    this.metrics.withdrawals.push({ user, amount, timestamp });
    this.saveMetrics();
  }

  recordFee(amount) {
    this.metrics.fees += amount;
    this.saveMetrics();
  }

  recordWalletConnection(user, method, timestamp, success = true) {
    this.metrics.walletConnections.push({ user, method, timestamp, success });
    if (success) this.metrics.users.add(user);
    this.saveMetrics();
  }

  recordWalletError(user, method, errorType, timestamp) {
    this.metrics.walletErrors.push({ user, method, errorType, timestamp });
    this.saveMetrics();
  }

  recordPerformanceMetric(operation, duration, timestamp) {
    this.metrics.performanceMetrics.push({ operation, duration, timestamp });
    this.saveMetrics();
  }

  getStats() {
    return {
      totalDeposits: this.metrics.deposits.reduce((sum, d) => sum + d.amount, 0),
      totalWithdrawals: this.metrics.withdrawals.reduce((sum, w) => sum + w.amount, 0),
      totalUsers: this.metrics.users.size,
      totalFees: this.metrics.fees,
      depositCount: this.metrics.deposits.length,
      withdrawalCount: this.metrics.withdrawals.length,
      walletConnectionCount: this.metrics.walletConnections.length,
      walletErrorCount: this.metrics.walletErrors.length,
      averagePerformance: this.getAveragePerformance()
    };
  }

  getTimeSeriesData(interval = 'daily') {
    const grouped = {};
    this.metrics.deposits.forEach(d => {
      const key = this.getTimeKey(d.timestamp, interval);
      grouped[key] = (grouped[key] || 0) + d.amount;
    });
    return grouped;
  }

  getTimeKey(timestamp, interval) {
    const date = new Date(timestamp);
    if (interval === 'daily') return date.toISOString().split('T')[0];
    if (interval === 'hourly') return date.toISOString().split(':')[0];
    return date.toISOString();
  }

  getAveragePerformance() {
    if (this.metrics.performanceMetrics.length === 0) return 0;
    const total = this.metrics.performanceMetrics.reduce((sum, p) => sum + p.duration, 0);
    return total / this.metrics.performanceMetrics.length;
  }

  getWalletStats() {
    const connections = this.metrics.walletConnections;
    const errors = this.metrics.walletErrors;
    const successRate = connections.length > 0 ? (connections.filter(c => c.success).length / connections.length) * 100 : 0;
    const methodStats = {};
    connections.forEach(c => {
      methodStats[c.method] = (methodStats[c.method] || 0) + 1;
    });
    return {
      totalConnections: connections.length,
      successRate: successRate.toFixed(2),
      methodBreakdown: methodStats,
      errorCount: errors.length
    };
  }

  getWalletTimeSeries(interval = 'daily') {
    const grouped = {};
    this.metrics.walletConnections.forEach(c => {
      const key = this.getTimeKey(c.timestamp, interval);
      if (!grouped[key]) grouped[key] = { connections: 0, errors: 0 };
      grouped[key].connections += 1;
    });
    this.metrics.walletErrors.forEach(e => {
      const key = this.getTimeKey(e.timestamp, interval);
      if (!grouped[key]) grouped[key] = { connections: 0, errors: 0 };
      grouped[key].errors += 1;
    });
    return grouped;
  }
}

module.exports = { MetricsCollector };