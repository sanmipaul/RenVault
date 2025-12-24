// Circuit Breaker
class CircuitBreaker {
  constructor() {
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.failureThreshold = 5;
    this.timeout = 60000; // 1 minute
    this.lastFailureTime = null;
    this.successCount = 0;
    this.halfOpenSuccessThreshold = 3;
  }

  async call(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.halfOpenSuccessThreshold) {
        this.state = 'CLOSED';
      }
    }
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      isOpen: this.state === 'OPEN'
    };
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
  }

  forceOpen() {
    this.state = 'OPEN';
    this.lastFailureTime = Date.now();
  }

  forceClose() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
  }
}

class ProtocolCircuitBreaker {
  constructor() {
    this.breakers = {
      deposits: new CircuitBreaker(),
      withdrawals: new CircuitBreaker(),
      transfers: new CircuitBreaker(),
      governance: new CircuitBreaker()
    };
  }

  async executeDeposit(operation) {
    return await this.breakers.deposits.call(operation);
  }

  async executeWithdrawal(operation) {
    return await this.breakers.withdrawals.call(operation);
  }

  async executeTransfer(operation) {
    return await this.breakers.transfers.call(operation);
  }

  async executeGovernance(operation) {
    return await this.breakers.governance.call(operation);
  }

  getStatus() {
    const status = {};
    for (const [name, breaker] of Object.entries(this.breakers)) {
      status[name] = breaker.getState();
    }
    return status;
  }

  emergencyStop() {
    for (const breaker of Object.values(this.breakers)) {
      breaker.forceOpen();
    }
  }

  resume() {
    for (const breaker of Object.values(this.breakers)) {
      breaker.forceClose();
    }
  }
}

module.exports = { CircuitBreaker, ProtocolCircuitBreaker };