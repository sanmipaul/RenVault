// Pause Controller
const { EmergencyMonitor } = require('./emergencyMonitor');

class PauseController {
  constructor() {
    this.monitor = new EmergencyMonitor();
    this.pauseState = {
      isPaused: false,
      reason: '',
      timestamp: null,
      pausedBy: null
    };
    this.emergencyContacts = new Set();
    this.pauseHistory = [];
  }

  addEmergencyContact(address) {
    this.emergencyContacts.add(address);
    return { success: true, contact: address };
  }

  removeEmergencyContact(address) {
    this.emergencyContacts.delete(address);
    return { success: true, contact: address };
  }

  isEmergencyContact(address) {
    return this.emergencyContacts.has(address);
  }

  emergencyPause(reason, pausedBy) {
    if (!this.isEmergencyContact(pausedBy)) {
      throw new Error('Unauthorized: Not an emergency contact');
    }

    if (this.pauseState.isPaused) {
      throw new Error('Protocol already paused');
    }

    this.pauseState = {
      isPaused: true,
      reason,
      timestamp: Date.now(),
      pausedBy
    };

    this.pauseHistory.push({
      action: 'PAUSE',
      reason,
      timestamp: Date.now(),
      by: pausedBy
    });

    return {
      success: true,
      message: 'Emergency pause activated',
      reason,
      timestamp: this.pauseState.timestamp
    };
  }

  resumeOperations(resumedBy) {
    if (!this.isEmergencyContact(resumedBy)) {
      throw new Error('Unauthorized: Not an emergency contact');
    }

    if (!this.pauseState.isPaused) {
      throw new Error('Protocol not paused');
    }

    const duration = Date.now() - this.pauseState.timestamp;
    
    this.pauseHistory.push({
      action: 'RESUME',
      reason: 'Manual resume',
      timestamp: Date.now(),
      by: resumedBy,
      duration
    });

    this.pauseState = {
      isPaused: false,
      reason: '',
      timestamp: null,
      pausedBy: null
    };

    return {
      success: true,
      message: 'Operations resumed',
      duration,
      timestamp: Date.now()
    };
  }

  checkAndPause() {
    if (this.pauseState.isPaused) return { alreadyPaused: true };

    const result = this.monitor.updateMetrics({
      withdrawalRate: Math.random() * 0.15,
      failedTransactions: Math.floor(Math.random() * 60),
      slippage: Math.random() * 0.08
    });

    if (this.monitor.shouldTriggerEmergencyPause()) {
      const reason = this.monitor.getEmergencyReason();
      return this.emergencyPause(reason, 'SYSTEM');
    }

    return { autoPauseTriggered: false, alerts: result.alerts };
  }

  getPauseStatus() {
    return {
      ...this.pauseState,
      duration: this.pauseState.isPaused ? Date.now() - this.pauseState.timestamp : 0
    };
  }

  getPauseHistory(limit = 20) {
    return this.pauseHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getEmergencyContacts() {
    return Array.from(this.emergencyContacts);
  }
}

module.exports = { PauseController };