const { EmergencyMonitor } = require('./emergencyMonitor');

describe('EmergencyMonitor', () => {
  let em;

  beforeEach(() => {
    em = new EmergencyMonitor();
  });

  describe('updateMetrics', () => {
    test('merges new metrics into existing', () => {
      em.updateMetrics({ withdrawalRate: 0.05 });
      expect(em.metrics.withdrawalRate).toBe(0.05);
    });

    test('triggers alert when withdrawal rate exceeds threshold', () => {
      const result = em.updateMetrics({ withdrawalRate: 0.15 });
      expect(result.alertsTriggered).toBeGreaterThan(0);
      expect(result.alerts.some(a => a.type === 'HIGH_WITHDRAWAL_RATE')).toBe(true);
    });

    test('triggers alert when failed transactions exceed threshold', () => {
      const result = em.updateMetrics({ failedTransactions: 60 });
      expect(result.alerts.some(a => a.type === 'HIGH_FAILURE_RATE')).toBe(true);
    });

    test('triggers alert when slippage exceeds threshold', () => {
      const result = em.updateMetrics({ slippage: 0.1 });
      expect(result.alerts.some(a => a.type === 'HIGH_SLIPPAGE')).toBe(true);
    });

    test('returns zero alerts when all metrics are normal', () => {
      const result = em.updateMetrics({ withdrawalRate: 0.01, failedTransactions: 5, slippage: 0.01 });
      expect(result.alertsTriggered).toBe(0);
    });
  });

  describe('shouldTriggerEmergencyPause', () => {
    test('returns false when no alerts exist', () => {
      expect(em.shouldTriggerEmergencyPause()).toBe(false);
    });

    test('returns true when a CRITICAL alert is present', () => {
      em.updateMetrics({ withdrawalRate: 0.99 });
      expect(em.shouldTriggerEmergencyPause()).toBe(true);
    });
  });

  describe('getEmergencyReason', () => {
    test('returns CRITICAL alert message when present', () => {
      em.updateMetrics({ withdrawalRate: 0.99 });
      const reason = em.getEmergencyReason();
      expect(typeof reason).toBe('string');
      expect(reason.length).toBeGreaterThan(0);
    });

    test('returns fallback message when no critical alerts', () => {
      expect(em.getEmergencyReason()).toBe('Multiple security alerts detected');
    });
  });

  describe('clearAlerts', () => {
    test('removes all stored alerts', () => {
      em.updateMetrics({ withdrawalRate: 0.99 });
      em.clearAlerts();
      expect(em.alerts).toHaveLength(0);
    });
  });

  describe('setThreshold', () => {
    test('updates a known threshold', () => {
      em.setThreshold('maxWithdrawalRate', 0.2);
      expect(em.thresholds.maxWithdrawalRate).toBe(0.2);
    });

    test('returns false for unknown threshold', () => {
      expect(em.setThreshold('unknown', 5)).toBe(false);
    });

    test('throws if value is negative', () => {
      expect(() => em.setThreshold('maxWithdrawalRate', -0.1)).toThrow('threshold value must be a non-negative number');
    });

    test('throws if value is not a number', () => {
      expect(() => em.setThreshold('maxWithdrawalRate', 'high')).toThrow();
    });
  });

  describe('getAlertHistory', () => {
    test('returns alerts sorted by timestamp descending', () => {
      em.updateMetrics({ withdrawalRate: 0.99 });
      em.updateMetrics({ failedTransactions: 60 });
      const history = em.getAlertHistory();
      expect(history.length).toBeGreaterThan(0);
      if (history.length > 1) {
        expect(history[0].timestamp).toBeGreaterThanOrEqual(history[1].timestamp);
      }
    });

    test('respects limit', () => {
      em.updateMetrics({ withdrawalRate: 0.99 });
      em.updateMetrics({ failedTransactions: 60 });
      em.updateMetrics({ slippage: 0.99 });
      expect(em.getAlertHistory(2).length).toBeLessThanOrEqual(2);
    });
  });
});
