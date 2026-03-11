const path = require('path');
const fs = require('fs');
const DataExporter = require('./dataExporter');

// Stub out the Stacks SDK so tests run without network access
jest.mock('@stacks/network', () => ({ StacksMainnet: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@stacks/transactions', () => ({
  callReadOnlyFunction: jest.fn(),
  standardPrincipalCV: jest.fn(addr => addr),
}));

const { callReadOnlyFunction } = require('@stacks/transactions');

// ─────────────────────────────────────────────────────────────────────────────
// exportAllUsers — input validation
// ─────────────────────────────────────────────────────────────────────────────

describe('DataExporter.exportAllUsers — input validation', () => {
  let exporter;
  beforeEach(() => { exporter = new DataExporter(); });

  test('throws TypeError when userAddresses is null', async () => {
    await expect(exporter.exportAllUsers(null)).rejects.toThrow(TypeError);
  });

  test('throws TypeError when userAddresses is undefined', async () => {
    await expect(exporter.exportAllUsers(undefined)).rejects.toThrow(TypeError);
  });

  test('throws TypeError when userAddresses is a string', async () => {
    await expect(exporter.exportAllUsers('ST1ABC')).rejects.toThrow(TypeError);
  });

  test('throws Error when userAddresses is an empty array', async () => {
    await expect(exporter.exportAllUsers([])).rejects.toThrow('must not be empty');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// exportAllUsers — failed export tracking
// ─────────────────────────────────────────────────────────────────────────────

describe('DataExporter.exportAllUsers — failed export tracking', () => {
  let exporter;

  beforeEach(() => {
    exporter = new DataExporter();
    callReadOnlyFunction.mockReset();
  });

  test('includes failedAddresses when some exports fail', async () => {
    // With Promise.allSettled both exportUserData calls start in parallel so
    // callReadOnlyFunction is called in interleaved order:
    //   #1 addr1-balance, #2 addr2-balance, #3 addr1-points
    // addr2-balance rejects → addr2 never requests points.
    callReadOnlyFunction
      .mockResolvedValueOnce({ value: '1000' })          // #1 addr1 balance
      .mockRejectedValueOnce(new Error('network error')) // #2 addr2 balance fails
      .mockResolvedValueOnce({ value: '5' });            // #3 addr1 points

    const result = await exporter.exportAllUsers(['addr1', 'addr2']);
    expect(result.failedCount).toBe(1);
    expect(result.failedAddresses).toContain('addr2');
    expect(result.totalUsers).toBe(1);
    expect(result.totalRequested).toBe(2);
  });

  test('returns zero failedCount when all exports succeed', async () => {
    callReadOnlyFunction
      .mockResolvedValueOnce({ value: '100' })
      .mockResolvedValueOnce({ value: '1' })
      .mockResolvedValueOnce({ value: '200' })
      .mockResolvedValueOnce({ value: '2' });

    const result = await exporter.exportAllUsers(['addr1', 'addr2']);
    expect(result.failedCount).toBe(0);
    expect(result.failedAddresses).toHaveLength(0);
    expect(result.totalUsers).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// saveBackup — input validation
// ─────────────────────────────────────────────────────────────────────────────

describe('DataExporter.saveBackup — input validation', () => {
  let exporter;

  beforeEach(() => {
    exporter = new DataExporter();
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  test('throws when data is null', () => {
    expect(() => exporter.saveBackup(null, 'test.json')).toThrow('null or undefined');
  });

  test('throws when data is undefined', () => {
    expect(() => exporter.saveBackup(undefined, 'test.json')).toThrow('null or undefined');
  });

  test('throws when filename is empty string', () => {
    expect(() => exporter.saveBackup({ users: [] }, '')).toThrow('filename');
  });

  test('throws when filename is not a string', () => {
    expect(() => exporter.saveBackup({ users: [] }, 42)).toThrow('filename');
  });

  test('writes the file and returns the filepath on valid input', () => {
    const filepath = exporter.saveBackup({ users: [] }, 'backup.json');
    expect(filepath).toContain('backup.json');
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
  });
});
