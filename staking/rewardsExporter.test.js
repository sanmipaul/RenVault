'use strict';

const { RewardsHistory } = require('./rewardsHistory');
const { RewardsExporter } = require('./rewardsExporter');

function makeExporter(entries = []) {
  const rh = new RewardsHistory();
  entries.forEach(([staker, amount, type]) => rh.addEntry(staker, amount, type));
  return { rh, ex: new RewardsExporter(rh) };
}

const STAKERS = [
  ['SP1', 100, 'distribution'],
  ['SP2', 200, 'claim'],
  ['SP1', 150, 'bonus'],
];

describe('RewardsExporter', () => {

  describe('constructor', () => {
    it('throws when history is missing', () => {
      expect(() => new RewardsExporter(null)).toThrow('RewardsHistory instance');
    });
  });

  // ─── toCSV ────────────────────────────────────────────────────────────────

  describe('toCSV', () => {
    it('produces a header row', () => {
      const { ex } = makeExporter(STAKERS);
      expect(ex.toCSV()).toMatch(/^epoch,staker,amount,type,timestamp,date/);
    });

    it('includes one data row per entry', () => {
      const { ex } = makeExporter(STAKERS);
      const lines = ex.toCSV().split('\n');
      expect(lines.length).toBe(STAKERS.length + 1); // header + rows
    });

    it('filters to a single staker when specified', () => {
      const { ex } = makeExporter(STAKERS);
      const lines = ex.toCSV('SP1').split('\n');
      // 2 SP1 entries + header
      expect(lines.length).toBe(3);
    });

    it('contains ISO date string in last column', () => {
      const { ex } = makeExporter([['SP1', 100]]);
      expect(ex.toCSV()).toMatch(/\d{4}-\d{2}-\d{2}T/);
    });
  });

  // ─── toJSON ───────────────────────────────────────────────────────────────

  describe('toJSON', () => {
    it('produces valid JSON', () => {
      const { ex } = makeExporter(STAKERS);
      expect(() => JSON.parse(ex.toJSON())).not.toThrow();
    });

    it('returns an array of entries', () => {
      const { ex } = makeExporter(STAKERS);
      const parsed = JSON.parse(ex.toJSON());
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(STAKERS.length);
    });

    it('pretty-prints when flag is set', () => {
      const { ex } = makeExporter(STAKERS);
      expect(ex.toJSON(undefined, true)).toContain('\n');
    });

    it('filters to staker when specified', () => {
      const { ex } = makeExporter(STAKERS);
      const parsed = JSON.parse(ex.toJSON('SP1'));
      expect(parsed.every(e => e.staker === 'SP1')).toBe(true);
    });
  });

  // ─── toPrettyTable ────────────────────────────────────────────────────────

  describe('toPrettyTable', () => {
    it('returns a non-empty string', () => {
      const { ex } = makeExporter(STAKERS);
      const table = ex.toPrettyTable();
      expect(typeof table).toBe('string');
      expect(table.length).toBeGreaterThan(0);
    });

    it('returns placeholder for empty history', () => {
      const { ex } = makeExporter();
      expect(ex.toPrettyTable()).toBe('(no reward history)');
    });

    it('contains column headers', () => {
      const { ex } = makeExporter(STAKERS);
      const table = ex.toPrettyTable();
      expect(table).toMatch(/Epoch/);
      expect(table).toMatch(/Amount/);
    });
  });

  // ─── filterForExport ──────────────────────────────────────────────────────

  describe('filterForExport', () => {
    it('returns entries within the time range', () => {
      const { ex } = makeExporter(STAKERS);
      const start = Date.now() - 5000;
      const filtered = ex.filterForExport(start);
      expect(filtered.length).toBe(STAKERS.length);
    });

    it('returns empty array for a future start', () => {
      const { ex } = makeExporter(STAKERS);
      const filtered = ex.filterForExport(Date.now() + 100_000);
      expect(filtered.length).toBe(0);
    });

    it('filters by type when provided', () => {
      const { ex } = makeExporter(STAKERS);
      const filtered = ex.filterForExport(0, Date.now(), 'claim');
      expect(filtered.every(e => e.type === 'claim')).toBe(true);
    });
  });

  // ─── countUniqueStakersInRange ────────────────────────────────────────────

  describe('countUniqueStakersInRange', () => {
    it('counts distinct stakers in range', () => {
      const { ex } = makeExporter(STAKERS);
      const count = ex.countUniqueStakersInRange(Date.now() - 5000);
      expect(count).toBe(2); // SP1 and SP2
    });

    it('returns 0 for empty range', () => {
      const { ex } = makeExporter(STAKERS);
      expect(ex.countUniqueStakersInRange(Date.now() + 100_000)).toBe(0);
    });
  });
});
