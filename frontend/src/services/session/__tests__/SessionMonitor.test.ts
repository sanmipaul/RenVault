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

  // ─── getRecentEvents ────────────────────────────────────────────────────

  describe('getRecentEvents', () => {
    it('returns at most the requested limit', () => {
      for (let i = 0; i < 10; i++) {
        monitor.recordEvent({ type: 'created' });
      }
      expect(monitor.getRecentEvents(3).length).toBe(3);
    });

    it('returns all events when limit exceeds event count', () => {
      monitor.recordEvent({ type: 'restored' });
      monitor.recordEvent({ type: 'extended' });
      expect(monitor.getRecentEvents(100).length).toBe(2);
    });

    it('returns empty array when no events recorded', () => {
      expect(monitor.getRecentEvents(10)).toEqual([]);
    });

    it('returns the most recent events last (chronological order)', () => {
      monitor.recordEvent({ type: 'created', sessionId: 'first' });
      monitor.recordEvent({ type: 'expired', sessionId: 'second' });
      const recent = monitor.getRecentEvents(2);
      expect(recent[recent.length - 1].sessionId).toBe('second');
    });
  });

  // ─── getEventsByType ────────────────────────────────────────────────────

  describe('getEventsByType', () => {
    it('returns only events matching the specified type', () => {
      monitor.recordEvent({ type: 'created' });
      monitor.recordEvent({ type: 'expired' });
      monitor.recordEvent({ type: 'created' });
      const created = monitor.getEventsByType('created');
      expect(created.length).toBe(2);
      created.forEach(e => expect(e.type).toBe('created'));
    });

    it('returns empty array when no events match', () => {
      monitor.recordEvent({ type: 'created' });
      expect(monitor.getEventsByType('failed').length).toBe(0);
    });
  });
});
