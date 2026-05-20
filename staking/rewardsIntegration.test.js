'use strict';
/**
 * Integration tests — full rewards lifecycle using StakingManager,
 * RewardsHistory, RewardsAnalytics, StakingStats, and RewardsExporter
 * working together.
 */

const { StakingManager } = require('./stakingManager');
const { RewardsHistory } = require('./rewardsHistory');
const { RewardsAnalytics } = require('./rewardsAnalytics');
const { StakingStats } = require('./stakingStats');
const { RewardsExporter } = require('./rewardsExporter');

const MIN_STAKE = 1_000_000; // 1 STX in micro-STX
const SP1 = 'SP1AAAAAAAAAAAAAAAAAAAAAAAAA111111111';
const SP2 = 'SP2BBBBBBBBBBBBBBBBBBBBBBBB222222222';

describe('Rewards lifecycle integration', () => {
  let sm, rh, ra, ss, ex;

  beforeEach(() => {
    sm = new StakingManager();
    rh = new RewardsHistory();
    ra = new RewardsAnalytics(rh);
    ss = new StakingStats(sm, rh);
    ex = new RewardsExporter(rh);
  });

  it('stake → distribute → record → export produces consistent data', () => {
    // Two stakers
    sm.stake(SP1, MIN_STAKE * 5);
    sm.stake(SP2, MIN_STAKE * 10);
    ss.recordSnapshot();

    // Simulate reward distribution
    rh.addEntry(SP1, 50_000, 'distribution');
    rh.addEntry(SP2, 100_000, 'distribution');

    // Snapshot after rewards
    ss.recordSnapshot();

    // Verify history
    expect(rh.getTotalDistributed()).toBe(150_000);
    expect(rh.getUniqueStakers().sort()).toEqual([SP1, SP2].sort());

    // Verify analytics
    const proto = ra.getProtocolMetrics();
    expect(proto.totalDistributed).toBe(150_000);
    expect(proto.uniqueStakers).toBe(2);

    // Verify stats report
    const report = ss.getFullReport();
    expect(report.totalStaked).toBe(MIN_STAKE * 15);
    expect(report.totalRewardsDistributed).toBe(150_000);

    // Verify export
    const csv = ex.toCSV();
    expect(csv.split('\n').length).toBe(3); // header + 2 rows
    const json = JSON.parse(ex.toJSON());
    expect(json.length).toBe(2);
  });

  it('top earners reflect staking proportions', () => {
    rh.addEntry(SP1, 200);
    rh.addEntry(SP2, 800);
    rh.addEntry(SP1, 300);

    const top = rh.getTopEarners(2);
    expect(top[0].staker).toBe(SP2);  // 800
    expect(top[1].staker).toBe(SP1);  // 500
  });

  it('filterForExport correctly scopes the CSV output', () => {
    const before = Date.now();
    rh.addEntry(SP1, 100);
    rh.addEntry(SP2, 200);
    const filtered = ex.filterForExport(before - 1000);
    expect(filtered.length).toBe(2);

    // Now filter by type — only distributions should appear
    const onlyDist = ex.filterForExport(before - 1000, Date.now(), 'distribution');
    expect(onlyDist.every(e => e.type === 'distribution')).toBe(true);
  });

  it('TVL growth rate is positive after staking more', () => {
    sm.stake(SP1, MIN_STAKE);
    ss.recordSnapshot();
    sm.stake(SP2, MIN_STAKE * 4);
    ss.recordSnapshot();
    expect(ss.getTVLGrowthRate()).toBeGreaterThan(0);
  });

  it('clear resets history without affecting stakingManager', () => {
    sm.stake(SP1, MIN_STAKE * 2);
    rh.addEntry(SP1, 1000);
    rh.clear();
    expect(rh.getTotalDistributed()).toBe(0);
    // StakingManager state is independent
    expect(sm.getGlobalStats().totalStaked).toBe(MIN_STAKE * 2);
  });
});
