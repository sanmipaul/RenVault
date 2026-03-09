const { ReferralTracker } = require('./referralTracker');

// ─────────────────────────────────────────────────────────────────────────────
// getTimeSeriesData — period validation
// ─────────────────────────────────────────────────────────────────────────────

describe('ReferralTracker.getTimeSeriesData — period validation', () => {
  let tracker;

  beforeEach(() => {
    tracker = new ReferralTracker();
  });

  test('throws for an unsupported period instead of silently corrupting data', () => {
    expect(() => tracker.getTimeSeriesData('monthly')).toThrow(
      'Unsupported period "monthly"'
    );
  });

  test('throws for an empty string period', () => {
    expect(() => tracker.getTimeSeriesData('')).toThrow('Unsupported period');
  });

  test('daily period groups events by calendar date', () => {
    const mar9 = new Date('2025-03-09T08:00:00Z').getTime();
    const mar10 = new Date('2025-03-10T10:00:00Z').getTime();

    jest.spyOn(Date, 'now')
      .mockReturnValueOnce(mar9)   // u1 → 2025-03-09
      .mockReturnValueOnce(mar9)   // u2 → 2025-03-09
      .mockReturnValueOnce(mar10); // u3 → 2025-03-10

    tracker.trackReferralRegistration('u1', 'ref1');
    tracker.trackReferralRegistration('u2', 'ref1');
    tracker.trackReferralRegistration('u3', 'ref1');

    jest.restoreAllMocks();

    const data = tracker.getTimeSeriesData('daily');
    expect(data['2025-03-09'].registrations).toBe(2);
    expect(data['2025-03-10'].registrations).toBe(1);
  });

  test('hourly period produces keys in YYYY-MM-DDTHH format', () => {
    jest.spyOn(Date, 'now')
      .mockReturnValue(new Date('2025-03-09T14:35:00Z').getTime());

    tracker.trackReferralRegistration('u1', 'ref1');

    jest.restoreAllMocks();

    const data = tracker.getTimeSeriesData('hourly');
    expect(Object.keys(data)).toContain('2025-03-09T14');
  });

  test('weekly period groups events falling in the same Monday-anchored week', () => {
    // Monday 2025-03-10 and Wednesday 2025-03-12 are in the same week
    jest.spyOn(Date, 'now')
      .mockReturnValueOnce(new Date('2025-03-10T00:00:00Z').getTime())
      .mockReturnValueOnce(new Date('2025-03-10T00:00:00Z').getTime())
      .mockReturnValueOnce(new Date('2025-03-12T00:00:00Z').getTime())
      .mockReturnValueOnce(new Date('2025-03-12T00:00:00Z').getTime());

    tracker.trackReferralRegistration('u1', 'ref1');
    tracker.trackReferralRegistration('u2', 'ref1');

    jest.restoreAllMocks();

    const data = tracker.getTimeSeriesData('weekly');
    // Both events map to the week starting on Monday 2025-03-10
    expect(data['2025-03-10'].registrations).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getEventHistory — must not mutate this.events
// ─────────────────────────────────────────────────────────────────────────────

describe('ReferralTracker.getEventHistory — does not mutate internal event log', () => {
  let tracker;

  beforeEach(() => {
    tracker = new ReferralTracker();
    // Record events in chronological order using controlled timestamps
    const times = [1000, 2000, 3000];
    times.forEach((t, i) => {
      jest.spyOn(Date, 'now').mockReturnValue(t);
      tracker.trackReferralRegistration(`u${i}`, 'ref1');
      jest.restoreAllMocks();
    });
  });

  test('returns events in descending timestamp order', () => {
    const history = tracker.getEventHistory();
    expect(history[0].timestamp).toBeGreaterThan(history[1].timestamp);
    expect(history[1].timestamp).toBeGreaterThan(history[2].timestamp);
  });

  test('calling getEventHistory twice returns the same order both times', () => {
    const first = tracker.getEventHistory();
    const second = tracker.getEventHistory();
    expect(first.map(e => e.timestamp)).toEqual(second.map(e => e.timestamp));
  });

  test('internal events array retains insertion order after getEventHistory', () => {
    const insertionOrder = tracker.events.map(e => e.timestamp);
    tracker.getEventHistory(); // would scramble if sort was in-place
    expect(tracker.events.map(e => e.timestamp)).toEqual(insertionOrder);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// updateMetrics — correct conversionRate
// ─────────────────────────────────────────────────────────────────────────────

describe('ReferralTracker.updateMetrics — conversionRate accuracy', () => {
  let tracker;

  beforeEach(() => {
    tracker = new ReferralTracker();
  });

  test('is 0 when no registrations have occurred', () => {
    expect(tracker.getMetrics().conversionRate).toBe(0);
  });

  test('is 0 when referred users registered but none transacted', () => {
    tracker.trackReferralRegistration('u1', 'ref1');
    tracker.trackReferralRegistration('u2', 'ref1');
    expect(tracker.getMetrics().conversionRate).toBe('0.0');
  });

  test('is 50% when 1 of 2 referred users later made a transaction', () => {
    tracker.trackReferralRegistration('u1', 'ref1');
    tracker.trackReferralRegistration('u2', 'ref1');
    // u1 makes a transaction — they are the referrer on a subsequent reward
    // In the model: u1 goes on to refer someone, generating a REFERRAL_REWARD
    // where referrerAddress === 'u1' (who was previously a referred user)
    tracker.trackReferralReward('u1', 100, 10000);
    expect(tracker.getMetrics().conversionRate).toBe('50.0');
  });

  test('does not count the original referrer as a converted referred user', () => {
    tracker.trackReferralRegistration('u1', 'ref1');
    // ref1 earns commission — ref1 was NOT a referred user, so should not count
    tracker.trackReferralReward('ref1', 100, 10000);
    // u1 never transacted
    expect(tracker.getMetrics().conversionRate).toBe('0.0');
  });
});
