// Emergency Monitor
class EmergencyMonitor {
  constructor() {
    this.alerts = [];
    this.thresholds = {
      maxWithdrawalRate: 0.1, // 10% of total in 1 hour
      maxFailedTx: 50,        // 50 failed transactions
      minGasPrice: 1000,      // Minimum gas price
      maxSlippage: 0.05       // 5% max slippage
    };
    this.metrics = {
      withdrawalRate: 0,
      failedTransactions: 0,
      gasPrice: 0,
      slippage: 0
    };
  }

  checkThresholds() {
    const alerts = [];

    if (this.metrics.withdrawalRate > this.thresholds.maxWithdrawalRate) {
      alerts.push({
        type: 'HIGH_WITHDRAWAL_RATE',
        severity: 'CRITICAL',
        message: `Withdrawal rate ${(this.metrics.withdrawalRate * 100).toFixed(1)}% exceeds threshold`,
        timestamp: Date.now()
      });
    }

    if (this.metrics.failedTransactions > this.thresholds.maxFailedTx) {
      alerts.push({
        type: 'HIGH_FAILURE_RATE',
        severity: 'HIGH',
        message: `${this.metrics.failedTransactions} failed transactions detected`,
        timestamp: Date.now()
      });
    }

    if (this.metrics.slippage > this.thresholds.maxSlippage) {
      alerts.push({
        type: 'HIGH_SLIPPAGE',
        severity: 'MEDIUM',
        message: `Slippage ${(this.metrics.slippage * 100).toFixed(1)}% above normal`,
        timestamp: Date.now()
      });
    }

    return alerts;
  }

  updateMetrics(newMetrics) {
    this.metrics = { ...this.metrics, ...newMetrics };
    const alerts = this.checkThresholds();
    
    if (alerts.length > 0) {
      this.alerts.push(...alerts);
      return { alertsTriggered: alerts.length, alerts };
    }

    return { alertsTriggered: 0, alerts: [] };
  }

  shouldTriggerEmergencyPause() {
    const criticalAlerts = this.alerts.filter(a => a.severity === 'CRITICAL');
    const recentAlerts = this.alerts.filter(a => Date.now() - a.timestamp < 300000); // 5 minutes

    return criticalAlerts.length > 0 || recentAlerts.length >= 3;
  }

  getEmergencyReason() {
    const criticalAlerts = this.alerts.filter(a => a.severity === 'CRITICAL');
    if (criticalAlerts.length > 0) {
      return criticalAlerts[0].message;
    }

    return 'Multiple security alerts detected';
  }

  clearAlerts() {
    this.alerts = [];
  }

  getAlertHistory(limit = 50) {
    return this.alerts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  setThreshold(type, value) {
    if (this.thresholds.hasOwnProperty(type)) {
      this.thresholds[type] = value;
      return true;
    }
    return false;
  }
}

module.exports = { EmergencyMonitor };