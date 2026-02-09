import { ReconnectionStrategy } from '../services/wallet/ReconnectionStrategy';

describe('ReconnectionStrategy', () => {
  it('should calculate exponential backoff delay', () => {
    const strategy = new ReconnectionStrategy();
    const delay1 = strategy.getNextDelay();
    const delay2 = strategy.getNextDelay();
    expect(delay2).toBeGreaterThan(delay1);
  });

  it('should respect max attempts', () => {
    const strategy = new ReconnectionStrategy({ maxAttempts: 3 });
    expect(strategy.canRetry()).toBe(true);
    strategy.getNextDelay();
    strategy.getNextDelay();
    strategy.getNextDelay();
    expect(strategy.canRetry()).toBe(false);
  });
});
