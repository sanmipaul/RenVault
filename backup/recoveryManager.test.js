const fs = require('fs');
const path = require('path');
const RecoveryManager = require('./recoveryManager');

const VALID_BACKUP = {
  exportedAt: '2025-03-09T10:00:00.000Z',
  totalUsers: 2,
  users: [
    { address: 'ST1ABC', balance: '1000', points: '5' },
    { address: 'ST2DEF', balance: '0',    points: '0' },
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// validateBackup — field presence and type checks
// ─────────────────────────────────────────────────────────────────────────────

describe('RecoveryManager.validateBackup', () => {
  let rm;
  beforeEach(() => { rm = new RecoveryManager(); });

  test('returns valid for a complete well-formed backup', () => {
    expect(rm.validateBackup(VALID_BACKUP)).toEqual({ valid: true });
  });

  test('accepts users with balance = 0 and points = 0', () => {
    const result = rm.validateBackup(VALID_BACKUP);
    expect(result.valid).toBe(true);
  });

  test('rejects when totalUsers field is missing', () => {
    const bad = { ...VALID_BACKUP };
    delete bad.totalUsers;
    expect(rm.validateBackup(bad).valid).toBe(false);
  });

  test('accepts totalUsers = 0 (falsy but present)', () => {
    const backup = { ...VALID_BACKUP, totalUsers: 0, users: [] };
    // totalUsers:0 must no longer be rejected by the falsy check
    const result = rm.validateBackup(backup);
    expect(result.valid).toBe(true);
  });

  test('rejects user with non-numeric balance', () => {
    const bad = {
      ...VALID_BACKUP,
      users: [{ address: 'ST1ABC', balance: 'NaN_val', points: '5' }]
    };
    expect(rm.validateBackup(bad).valid).toBe(false);
    expect(rm.validateBackup(bad).error).toMatch(/balance/);
  });

  test('rejects user with non-numeric points', () => {
    const bad = {
      ...VALID_BACKUP,
      users: [{ address: 'ST1ABC', balance: '100', points: 'bad' }]
    };
    expect(rm.validateBackup(bad).valid).toBe(false);
    expect(rm.validateBackup(bad).error).toMatch(/points/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// generateRecoveryReport — division by zero + correct totalUsers
// ─────────────────────────────────────────────────────────────────────────────

describe('RecoveryManager.generateRecoveryReport', () => {
  let rm;
  beforeEach(() => { rm = new RecoveryManager(); });

  test('returns 0 averages for an empty users array instead of Infinity', () => {
    const backup = { exportedAt: '2025-03-09T10:00:00Z', totalUsers: 0, users: [] };
    const report = rm.generateRecoveryReport(backup);
    expect(report.averageBalance).toBe(0);
    expect(report.averagePoints).toBe(0);
    expect(Number.isFinite(report.averageBalance)).toBe(true);
  });

  test('derives totalUsers from users.length, not the stored field', () => {
    // stored totalUsers is wrong (3) but actual array has 2 entries
    const backup = { ...VALID_BACKUP, totalUsers: 3 };
    const report = rm.generateRecoveryReport(backup);
    expect(report.totalUsers).toBe(2);
  });

  test('sums balance and points correctly', () => {
    const report = rm.generateRecoveryReport(VALID_BACKUP);
    expect(report.totalBalance).toBe(1000);
    expect(report.totalPoints).toBe(5);
  });

  test('averages are floored integers', () => {
    const report = rm.generateRecoveryReport(VALID_BACKUP);
    expect(Number.isInteger(report.averageBalance)).toBe(true);
    expect(Number.isInteger(report.averagePoints)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// loadBackup — JSON parse error handling
// ─────────────────────────────────────────────────────────────────────────────

describe('RecoveryManager.loadBackup — JSON parse error handling', () => {
  let rm;

  beforeEach(() => {
    rm = new RecoveryManager();
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
  });

  afterEach(() => jest.restoreAllMocks());

  test('throws descriptive error for corrupted (invalid JSON) backup file', () => {
    jest.spyOn(fs, 'readFileSync').mockReturnValue('{ invalid json !!!');
    expect(() => rm.loadBackup('corrupted.json'))
      .toThrow('contains invalid JSON');
  });

  test('throws file-not-found error when file does not exist', () => {
    fs.existsSync.mockReturnValue(false);
    expect(() => rm.loadBackup('missing.json'))
      .toThrow('not found');
  });

  test('returns parsed object for a valid backup file', () => {
    jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(VALID_BACKUP));
    const result = rm.loadBackup('good.json');
    expect(result.totalUsers).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// validateWalletBackup — version allowlist
// ─────────────────────────────────────────────────────────────────────────────

describe('RecoveryManager.validateWalletBackup — version allowlist', () => {
  let rm;
  beforeEach(() => { rm = new RecoveryManager(); });

  const VALID_WALLET = {
    address: 'ST1ABC',
    publicKey: 'pubkey123',
    encryptedMnemonic: 'enc123',
    createdAt: '2025-01-01T00:00:00Z',
    version: '1.0'
  };

  test('accepts version 1.0', () => {
    expect(rm.validateWalletBackup(VALID_WALLET).valid).toBe(true);
  });

  test('rejects unsupported version with descriptive message', () => {
    const result = rm.validateWalletBackup({ ...VALID_WALLET, version: '9.9' });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Supported/);
  });

  test('error message includes the rejected version', () => {
    const result = rm.validateWalletBackup({ ...VALID_WALLET, version: '2.0' });
    expect(result.error).toContain('2.0');
  });
});
