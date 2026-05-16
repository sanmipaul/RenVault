import { SessionMonitor, SessionEvent } from '../SessionMonitor';

// Prevent the singleton's setInterval from keeping the process alive
jest.useFakeTimers();

// Silence logger during tests
jest.mock('../../../utils/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

// SessionManager is injected via singleton inside SessionMonitor constructor
jest.mock('../SessionManager', () => ({
  SessionManager: {
    getInstance: jest.fn().mockReturnValue({}),
  },
}));

describe('SessionMonitor', () => {
  let monitor: SessionMonitor;

  beforeEach(() => {
    monitor = SessionMonitor.getInstance();
    monitor.clearAllEvents();
  });

  // ─── recordEvent ────────────────────────────────────────────────────────

  describe('recordEvent', () => {
    it('stores a recorded event', () => {
      monitor.recordEvent({ type: 'created', sessionId: 'abc' });
      expect(monitor.getRecentEvents(1)[0].type).toBe('created');
    });

    it('attaches a timestamp to each recorded event', () => {
      const before = Date.now();
      monitor.recordEvent({ type: 'restored' });
      const after = Date.now();
      const event = monitor.getRecentEvents(1)[0];
      expect(event.timestamp).toBeGreaterThanOrEqual(before);
      expect(event.timestamp).toBeLessThanOrEqual(after);
    });

    it('stores multiple events in order', () => {
      monitor.recordEvent({ type: 'created' });
      monitor.recordEvent({ type: 'expired' });
      const events = monitor.getRecentEvents(10);
      expect(events[0].type).toBe('created');
      expect(events[1].type).toBe('expired');
    });
  });
});
