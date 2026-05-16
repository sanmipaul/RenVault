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

  // ─── getMetrics ─────────────────────────────────────────────────────────

  describe('getMetrics', () => {
    it('counts total sessions from "created" events', () => {
      monitor.recordEvent({ type: 'created', sessionId: 's1' });
      monitor.recordEvent({ type: 'created', sessionId: 's2' });
      expect(monitor.getMetrics().totalSessions).toBe(2);
    });

    it('counts expired sessions from "expired" events', () => {
      monitor.recordEvent({ type: 'expired', sessionId: 's1' });
      expect(monitor.getMetrics().expiredSessions).toBe(1);
    });

    it('counts active sessions as sessions without an end event', () => {
      monitor.recordEvent({ type: 'created', sessionId: 'active' });
      expect(monitor.getMetrics().activeSessions).toBe(1);
    });

    it('calculates average session duration for completed sessions', () => {
      jest.setSystemTime(1000);
      monitor.recordEvent({ type: 'created', sessionId: 'dur1' });
      jest.setSystemTime(6000);
      monitor.recordEvent({ type: 'expired', sessionId: 'dur1' });
      const metrics = monitor.getMetrics();
      expect(metrics.averageSessionDuration).toBe(5000);
    });

    it('returns 0 averageSessionDuration when no sessions completed', () => {
      monitor.recordEvent({ type: 'created', sessionId: 'ongoing' });
      expect(monitor.getMetrics().averageSessionDuration).toBe(0);
    });

    it('counts reconnection attempts', () => {
      monitor.recordEvent({ type: 'reconnected' });
      monitor.recordEvent({ type: 'failed' });
      const metrics = monitor.getMetrics();
      expect(metrics.reconnectionAttempts).toBe(2);
      expect(metrics.successfulReconnections).toBe(1);
      expect(metrics.failedReconnections).toBe(1);
    });
  });

  // ─── clearOldEvents ─────────────────────────────────────────────────────

  describe('clearOldEvents', () => {
    it('removes events older than the specified days', () => {
      jest.setSystemTime(Date.now() - 40 * 24 * 60 * 60 * 1000); // 40 days ago
      monitor.recordEvent({ type: 'created' });
      jest.setSystemTime(Date.now() + 40 * 24 * 60 * 60 * 1000); // restore
      monitor.clearOldEvents(30);
      expect(monitor.getRecentEvents(10).length).toBe(0);
    });

    it('keeps recent events within the threshold', () => {
      monitor.recordEvent({ type: 'created' });
      monitor.clearOldEvents(30);
      expect(monitor.getRecentEvents(10).length).toBe(1);
    });
  });

  // ─── importEvents / clearAllEvents ──────────────────────────────────────

  describe('importEvents and clearAllEvents', () => {
    it('clearAllEvents empties the event store', () => {
      monitor.recordEvent({ type: 'created' });
      monitor.recordEvent({ type: 'expired' });
      monitor.clearAllEvents();
      expect(monitor.getRecentEvents(100)).toEqual([]);
    });

    it('importEvents adds external events to the store', () => {
      const external: SessionEvent[] = [
        { type: 'created', timestamp: Date.now() - 1000, sessionId: 'ext1' },
        { type: 'expired', timestamp: Date.now(), sessionId: 'ext1' },
      ];
      monitor.importEvents(external);
      expect(monitor.getRecentEvents(10).length).toBe(2);
    });

    it('importEvents does not duplicate existing events', () => {
      monitor.recordEvent({ type: 'created', sessionId: 'local1' });
      const external: SessionEvent[] = [
        { type: 'restored', timestamp: Date.now(), sessionId: 'ext1' },
      ];
      monitor.importEvents(external);
      expect(monitor.getRecentEvents(100).length).toBe(2);
    });
  });
});
