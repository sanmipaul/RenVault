// Metrics Collector
class MetricsCollector {
  constructor() {
    this.metrics = {
      deposits: [],
      withdrawals: [],
      users: new Set(),
      fees: 0
    };
  }

  recordDeposit(user, amount, timestamp) {
    this.metrics.deposits.push({ user, amount, timestamp });
    this.metrics.users.add(user);
  }

  recordWithdrawal(user, amount, timestamp) {
    this.metrics.withdrawals.push({ user, amount, timestamp });
  }

  recordFee(amount) {
    this.metrics.fees += amount;
  }

  getStats() {
    return {
      totalDeposits: this.metrics.deposits.reduce((sum, d) => sum + d.amount, 0),
      totalWithdrawals: this.metrics.withdrawals.reduce((sum, w) => sum + w.amount, 0),
      totalUsers: this.metrics.users.size,
      totalFees: this.metrics.fees,
      depositCount: this.metrics.deposits.length,
      withdrawalCount: this.metrics.withdrawals.length
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
}

module.exports = { MetricsCollector };