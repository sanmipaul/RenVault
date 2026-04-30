const { CircuitBreaker, ProtocolCircuitBreaker } = require('./circuitBreaker');

describe('CircuitBreaker', () => {
  let cb;

  beforeEach(() => {
    cb = new CircuitBreaker();
  });

  describe('initial state', () => {
    test('starts CLOSED', () => {
      expect(cb.getState().state).toBe('CLOSED');
    });
  });

  describe('call - CLOSED state', () => {
    test('executes operation and returns result', async () => {
      const result = await cb.call(async () => 42);
      expect(result).toBe(42);
    });

    test('resets failureCount on success', async () => {
      cb.failureCount = 3;
      await cb.call(async () => 'ok');
      expect(cb.failureCount).toBe(0);
    });

    test('increments failureCount on failure', async () => {
      await expect(cb.call(async () => { throw new Error('fail'); })).rejects.toThrow('fail');
      expect(cb.failureCount).toBe(1);
    });

    test('opens circuit after threshold failures', async () => {
      for (let i = 0; i < 5; i++) {
        await expect(cb.call(async () => { throw new Error('x'); })).rejects.toThrow();
      }
      expect(cb.getState().state).toBe('OPEN');
    });
  });

  describe('call - OPEN state', () => {
    test('throws circuit breaker error immediately', async () => {
      cb.forceOpen();
      await expect(cb.call(async () => 'ok')).rejects.toThrow('Circuit breaker is OPEN');
    });

    test('transitions to HALF_OPEN after timeout elapses', async () => {
      cb.forceOpen();
      cb.lastFailureTime = Date.now() - cb.timeout - 1;
      await cb.call(async () => 'ok'); // first success in HALF_OPEN
      expect(['HALF_OPEN', 'CLOSED']).toContain(cb.getState().state);
    });
  });

  describe('HALF_OPEN recovery', () => {
    test('closes circuit after enough successes', async () => {
      cb.state = 'HALF_OPEN';
      cb.successCount = 0;
      for (let i = 0; i < 3; i++) {
        await cb.call(async () => 'ok');
      }
      expect(cb.getState().state).toBe('CLOSED');
    });
  });

  describe('forceOpen / forceClose', () => {
    test('forceOpen sets state to OPEN', () => {
      cb.forceOpen();
      expect(cb.getState().state).toBe('OPEN');
    });

    test('forceClose sets state to CLOSED and resets failure count', () => {
      cb.forceOpen();
      cb.forceClose();
      expect(cb.getState().state).toBe('CLOSED');
      expect(cb.failureCount).toBe(0);
    });
  });

  describe('reset', () => {
    test('resets all state to initial values', () => {
      cb.forceOpen();
      cb.reset();
      expect(cb.getState().state).toBe('CLOSED');
      expect(cb.failureCount).toBe(0);
    });
  });
});

describe('ProtocolCircuitBreaker', () => {
  let pcb;

  beforeEach(() => {
    pcb = new ProtocolCircuitBreaker();
  });

  test('executeDeposit runs operation successfully', async () => {
    const result = await pcb.executeDeposit(async () => 'deposited');
    expect(result).toBe('deposited');
  });

  test('emergencyStop opens all breakers', () => {
    pcb.emergencyStop();
    const status = pcb.getStatus();
    expect(status.deposits.isOpen).toBe(true);
    expect(status.withdrawals.isOpen).toBe(true);
    expect(status.transfers.isOpen).toBe(true);
    expect(status.governance.isOpen).toBe(true);
  });

  test('resume closes all breakers', () => {
    pcb.emergencyStop();
    pcb.resume();
    const status = pcb.getStatus();
    expect(status.deposits.isOpen).toBe(false);
    expect(status.withdrawals.isOpen).toBe(false);
  });
});
