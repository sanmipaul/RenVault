jest.mock('./dataExporter');
const DataExporter = require('./dataExporter');
const BackupScheduler = require('./scheduler');

beforeEach(() => {
  jest.useFakeTimers();
  DataExporter.mockClear();
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// addUser / addUsers — input validation
// ─────────────────────────────────────────────────────────────────────────────

describe('BackupScheduler.addUser / addUsers — input validation', () => {
  let scheduler;
  beforeEach(() => { scheduler = new BackupScheduler(); });

  test('addUser throws TypeError for null', () => {
    expect(() => scheduler.addUser(null)).toThrow(TypeError);
  });

  test('addUser throws TypeError for empty string', () => {
    expect(() => scheduler.addUser('')).toThrow(TypeError);
  });

  test('addUser adds a valid address', () => {
    scheduler.addUser('ST1ABC');
    expect(scheduler.knownUsers.has('ST1ABC')).toBe(true);
  });

  test('addUsers throws TypeError when passed null', () => {
    expect(() => scheduler.addUsers(null)).toThrow(TypeError);
  });

  test('addUsers throws TypeError when passed a string', () => {
    expect(() => scheduler.addUsers('ST1ABC')).toThrow(TypeError);
  });

  test('addUsers silently skips null/empty entries in the array', () => {
    scheduler.addUsers(['ST1ABC', null, '', 'ST2DEF']);
    expect(scheduler.knownUsers.size).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// removeUser
// ─────────────────────────────────────────────────────────────────────────────

describe('BackupScheduler.removeUser', () => {
  let scheduler;
  beforeEach(() => { scheduler = new BackupScheduler(); });

  test('removes an existing user', () => {
    scheduler.addUser('ST1ABC');
    scheduler.removeUser('ST1ABC');
    expect(scheduler.knownUsers.has('ST1ABC')).toBe(false);
  });

  test('does not throw when removing a non-existent user', () => {
    expect(() => scheduler.removeUser('ST_UNKNOWN')).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// start() — duplicate call guard
// ─────────────────────────────────────────────────────────────────────────────

describe('BackupScheduler.start — duplicate call guard', () => {
  test('second start() call does not stack an additional timer', () => {
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    const scheduler = new BackupScheduler();
    DataExporter.prototype.createFullBackup = jest.fn().mockResolvedValue('/path/backup.json');

    scheduler.addUser('ST1ABC');
    scheduler.start(1);
    const callsAfterFirst = setTimeoutSpy.mock.calls.length;

    scheduler.start(1); // should be a no-op
    expect(setTimeoutSpy.mock.calls.length).toBe(callsAfterFirst);

    scheduler.stop();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// stop() — cancels initial timeout
// ─────────────────────────────────────────────────────────────────────────────

describe('BackupScheduler.stop — cancels pending timers', () => {
  test('sets isRunning to false', () => {
    const scheduler = new BackupScheduler();
    DataExporter.prototype.createFullBackup = jest.fn().mockResolvedValue('/path');
    scheduler.addUser('ST1ABC');
    scheduler.start(1);
    scheduler.stop();
    expect(scheduler.isRunning).toBe(false);
  });

  test('clears initialTimeoutId after stop', () => {
    const scheduler = new BackupScheduler();
    DataExporter.prototype.createFullBackup = jest.fn().mockResolvedValue('/path');
    scheduler.addUser('ST1ABC');
    scheduler.start(1);
    scheduler.stop();
    expect(scheduler.initialTimeoutId).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getStatus — no address leak
// ─────────────────────────────────────────────────────────────────────────────

describe('BackupScheduler.getStatus — no address leakage', () => {
  test('does not include user addresses in status response', () => {
    const scheduler = new BackupScheduler();
    scheduler.addUser('ST1SENSITIVE');
    const status = scheduler.getStatus();
    expect(status).not.toHaveProperty('users');
    expect(JSON.stringify(status)).not.toContain('ST1SENSITIVE');
  });

  test('reports correct userCount', () => {
    const scheduler = new BackupScheduler();
    scheduler.addUser('ST1ABC');
    scheduler.addUser('ST2DEF');
    expect(scheduler.getStatus().userCount).toBe(2);
  });
});
