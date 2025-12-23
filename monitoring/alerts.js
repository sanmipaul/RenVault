class AlertSystem {
  constructor() {
    this.thresholds = {
      maxFees: 1000000000, // 1000 STX in microSTX
      maxUsers: 10000,
      errorRate: 0.1
    };
  }

  checkMetrics(metrics) {
    const alerts = [];

    if (metrics.totalFees > this.thresholds.maxFees) {
      alerts.push({
        type: 'HIGH_FEES',
        message: `High fee accumulation: ${metrics.totalFees} microSTX`,
        severity: 'warning'
      });
    }

    if (metrics.errorRate > this.thresholds.errorRate) {
      alerts.push({
        type: 'HIGH_ERROR_RATE',
        message: `Error rate above threshold: ${metrics.errorRate}`,
        severity: 'critical'
      });
    }

    return alerts;
  }

  sendAlert(alert) {
    console.log(`🚨 ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);
  }
}

module.exports = AlertSystem;