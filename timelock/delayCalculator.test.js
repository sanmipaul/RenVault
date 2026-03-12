const { DelayCalculator } = require('./delayCalculator');

describe('DelayCalculator', () => {
  let dc;

  beforeEach(() => {
    dc = new DelayCalculator();
  });

  // calculateDelay
  describe('calculateDelay', () => {
    test('resolves a preset string', () => {
      expect(dc.calculateDelay('1day')).toBe(86400000);
    });

    test('returns a valid positive number directly', () => {
      expect(dc.calculateDelay(3600000)).toBe(3600000);
    });

    test('parses a time string like "2d 3h"', () => {
      const expected = 2 * 86400000 + 3 * 3600000;
      expect(dc.calculateDelay('2d 3h')).toBe(expected);
    });

    test('throws for zero milliseconds', () => {
      expect(() => dc.calculateDelay(0)).toThrow('delay must be a positive number');
    });

    test('throws for negative milliseconds', () => {
      expect(() => dc.calculateDelay(-5000)).toThrow('delay must be a positive number');
    });

    test('throws for an unparseable string', () => {
      expect(() => dc.calculateDelay('never')).toThrow('Invalid time format');
    });

    test('throws for unsupported type', () => {
      expect(() => dc.calculateDelay(null)).toThrow('Invalid delay format');
    });
  });

  // formatDelay
  describe('formatDelay', () => {
    test('formats days correctly', () => {
      expect(dc.formatDelay(86400000)).toBe('1d');
    });

    test('formats combined units', () => {
      expect(dc.formatDelay(90061000)).toBe('1d 1h 1m 1s');
    });

    test('returns "0s" for 0ms', () => {
      expect(dc.formatDelay(0)).toBe('0s');
    });
  });

  // validateDelay
  describe('validateDelay', () => {
    const MIN = 3600000;   // 1h
    const MAX = 86400000;  // 1d

    test('returns ms for a valid delay', () => {
      expect(dc.validateDelay('6hours', MIN, MAX)).toBe(21600000);
    });

    test('throws if delay is below minimum', () => {
      expect(() => dc.validateDelay('1hour', MIN * 2, MAX)).toThrow('Delay too short');
    });

    test('throws if delay exceeds maximum', () => {
      expect(() => dc.validateDelay('1week', MIN, MAX)).toThrow('Delay too long');
    });

    test('throws if minDelay is not positive', () => {
      expect(() => dc.validateDelay('1day', 0, MAX)).toThrow('minDelay must be a positive number');
    });

    test('throws if maxDelay is not positive', () => {
      expect(() => dc.validateDelay('1day', MIN, -1)).toThrow('maxDelay must be a positive number');
    });

    test('throws if minDelay >= maxDelay', () => {
      expect(() => dc.validateDelay('1day', MAX, MIN)).toThrow('minDelay must be less than maxDelay');
    });
  });

  // getOptimalDelay
  describe('getOptimalDelay', () => {
    test('returns 1hour for low risk', () => {
      expect(dc.getOptimalDelay('low')).toBe(dc.presets['1hour']);
    });

    test('returns 1day for medium risk', () => {
      expect(dc.getOptimalDelay('medium')).toBe(dc.presets['1day']);
    });

    test('returns 1day for unknown risk', () => {
      expect(dc.getOptimalDelay('unknown')).toBe(dc.presets['1day']);
    });
  });

  // getPresets
  describe('getPresets', () => {
    test('returns an array of all presets with name, value, and formatted', () => {
      const presets = dc.getPresets();
      expect(Array.isArray(presets)).toBe(true);
      expect(presets.length).toBeGreaterThan(0);
      expect(presets[0]).toHaveProperty('name');
      expect(presets[0]).toHaveProperty('value');
      expect(presets[0]).toHaveProperty('formatted');
    });
  });
});
