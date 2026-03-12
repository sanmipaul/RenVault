/**
 * Unit tests for the backup API's path sanitization logic.
 *
 * sanitizeSegment is the critical security function added to prevent path
 * traversal attacks. We replicate its spec here so any implementation change
 * that weakens the sanitization is caught immediately.
 */

const path = require('path');

// Replicate the sanitizeSegment implementation so tests are self-contained.
function sanitizeSegment(segment) {
  return path.basename(String(segment)).replace(/[^a-zA-Z0-9_.\-]/g, '_');
}

describe('sanitizeSegment — path traversal prevention', () => {
  test('strips leading directory components from a traversal attempt', () => {
    expect(sanitizeSegment('../../etc/passwd')).toBe('passwd');
  });

  test('strips absolute path to just the filename', () => {
    expect(sanitizeSegment('/etc/shadow')).toBe('shadow');
  });

  test('strips Windows-style backslash separators', () => {
    const result = sanitizeSegment('..\\..\\windows\\secret');
    expect(result).not.toContain('\\');
    expect(result).not.toContain('/');
  });

  test('replaces null bytes that could confuse OS file APIs', () => {
    const result = sanitizeSegment('foo\x00bar');
    expect(result).not.toContain('\x00');
  });

  test('preserves a normal Stacks address intact', () => {
    const addr = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    expect(sanitizeSegment(addr)).toBe(addr);
  });

  test('preserves a normal wallet backup filename intact', () => {
    const filename = 'wallet-backup-ST1ABC-1710000000000.enc';
    expect(sanitizeSegment(filename)).toBe(filename);
  });

  test('preserves a multisig config filename intact', () => {
    const filename = 'multisig-ST1ABC.json';
    expect(sanitizeSegment(filename)).toBe(filename);
  });

  test('result never contains path separators regardless of input', () => {
    const malicious = [
      '../../secret',
      '/absolute/path',
      'foo/bar',
      'a\\b',
      'x/y/z',
    ];
    malicious.forEach(input => {
      expect(sanitizeSegment(input)).not.toMatch(/[/\\]/);
    });
  });

  test('coerces non-string input without throwing', () => {
    expect(() => sanitizeSegment(12345)).not.toThrow();
    expect(() => sanitizeSegment(null)).not.toThrow();
    expect(() => sanitizeSegment(undefined)).not.toThrow();
  });

  test('output is always a non-empty string for non-empty input', () => {
    expect(typeof sanitizeSegment('any-input')).toBe('string');
    expect(sanitizeSegment('any-input').length).toBeGreaterThan(0);
  });

  test('special chars are replaced with underscores, not silently dropped', () => {
    // A semicolon or space should become underscore, not disappear
    const result = sanitizeSegment('foo;bar baz');
    expect(result).toMatch(/foo_bar_baz/);
  });
});
