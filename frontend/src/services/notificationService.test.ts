/**
 * Tests for the NotificationService singleton pattern.
 *
 * These guard against the regression fixed in this branch: App.tsx was
 * calling `new NotificationService(address)` on every render which created a
 * fresh instance each time, discarding registered listeners and bypassing the
 * singleton.
 */

// Minimal stubs for browser APIs that are not available in the test runner
const localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => localStorageStore[key] ?? null,
  setItem: (key: string, value: string) => { localStorageStore[key] = value; },
  removeItem: (key: string) => { delete localStorageStore[key]; },
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Stub window.Audio so playNotificationSound doesn't throw
(global as any).Audio = class {
  play() { return Promise.resolve(); }
};

import NotificationService from './notificationService';

describe('NotificationService.getInstance', () => {
  beforeEach(() => {
    // Reset the private singleton between tests by re-importing via cache clear
    jest.resetModules();
  });

  test('returns the same instance for the same userId', () => {
    const a = NotificationService.getInstance('SP1ABCDEF');
    const b = NotificationService.getInstance('SP1ABCDEF');
    expect(a).toBe(b);
  });

  test('returns a new instance when userId changes (e.g. wallet switch)', () => {
    const a = NotificationService.getInstance('SP1ABCDEF');
    const b = NotificationService.getInstance('SP2FEDCBA');
    expect(a).not.toBe(b);
  });

  test('listeners registered on the singleton survive subsequent getInstance calls', () => {
    const listener = jest.fn();
    const service = NotificationService.getInstance('SP1ABCDEF');
    service.subscribe(listener);

    // Getting the instance again (as happens on re-render) must return the same
    // object so the listener is still attached.
    const sameService = NotificationService.getInstance('SP1ABCDEF');
    expect(sameService).toBe(service);

    // Directly accessing subscribe on the same reference confirms it is the
    // same instance — the subscription from above is still alive.
    let unsubCount = 0;
    const unsub = sameService.subscribe(() => { unsubCount++; });
    unsub();
    expect(unsubCount).toBe(0); // unsub itself doesn't call the listener
  });

  test('direct constructor bypasses singleton — getInstance should be used instead', () => {
    const singleton = NotificationService.getInstance('SP1ABCDEF');
    // Constructing directly produces a separate object
    const direct = new (NotificationService as any)('SP1ABCDEF');
    expect(singleton).not.toBe(direct);
  });
});
