// Data Processor for Blockchain Events
class DataProcessor {
  constructor(metricsCollector) {
    this.metrics = metricsCollector;
    this.eventQueue = [];
  }

  processEvent(event) {
    this.eventQueue.push(event);
    
    switch (event.type) {
      case 'deposit':
        this.processDeposit(event);
        break;
      case 'withdrawal':
        this.processWithdrawal(event);
        break;
      case 'fee_collected':
        this.processFee(event);
        break;
    }
  }

  processDeposit(event) {
    this.metrics.recordDeposit(
      event.data.user,
      event.data.amount,
      event.timestamp
    );
  }

  processWithdrawal(event) {
    this.metrics.recordWithdrawal(
      event.data.user,
      event.data.amount,
      event.timestamp
    );
  }

  processFee(event) {
    this.metrics.recordFee(event.data.amount);
  }

  getProcessedEvents() {
    return this.eventQueue.length;
  }

  clearQueue() {
    this.eventQueue = [];
  }
}

module.exports = { DataProcessor };