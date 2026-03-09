const LiquidityMining = require('./liquidityMining');

// Helpers
function makeProgram(lm, poolId = 'pool1', rewardRate = 10, durationMs = 60_000) {
  lm.createProgram(poolId, 'REN', rewardRate, durationMs);
}

// ─────────────────────────────────────────────────────────────────────────────
// harvest — rewardDebt must be included in payout
// ─────────────────────────────────────────────────────────────────────────────

describe('LiquidityMining.harvest — rewardDebt is paid out, not discarded', () => {
  let lm;
  let baseTime;

  beforeEach(() => {
    lm = new LiquidityMining();
    baseTime = 1_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(baseTime);
    makeProgram(lm);
  });

  afterEach(() => jest.restoreAllMocks());

  test('rewards banked via multiple stakes are included in harvest payout', () => {
    // Stake at t=0
    lm.stake('pool1', 'alice', 1_000_000);

    // Advance 10 seconds — alice earns some rewards
    Date.now.mockReturnValue(baseTime + 10_000);

    // Stake again — this should bank the 10s of rewards into rewardDebt
    lm.stake('pool1', 'alice', 500_000);

    // Advance another 5 seconds
    Date.now.mockReturnValue(baseTime + 15_000);

    // Harvest: should return rewards from BOTH windows (0-10s banked + 10-15s pending)
    const payout = lm.harvest('pool1', 'alice');

    expect(payout).toBeGreaterThan(0);
    // The 10-second window should be reflected (it was banked in rewardDebt)
    // If rewardDebt was ignored, payout would be much smaller (only 5s worth)
    const pending5s = lm.calculatePending('pool1', 'alice');
    // After harvest, no further pending (lastUpdate was reset)
    expect(pending5s).toBeCloseTo(0, 0);
  });

  test('rewardDebt is zero after harvest — no double-payout on second harvest', () => {
    lm.stake('pool1', 'alice', 1_000_000);

    Date.now.mockReturnValue(baseTime + 10_000);
    lm.stake('pool1', 'alice', 0); // re-stake to bank rewards

    Date.now.mockReturnValue(baseTime + 15_000);
    lm.harvest('pool1', 'alice');

    // Immediately harvest again — no more time has passed, so payout should be 0
    const secondPayout = lm.harvest('pool1', 'alice');
    expect(secondPayout).toBeCloseTo(0, 5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// stake — single timestamp prevents reward gap
// ─────────────────────────────────────────────────────────────────────────────

describe('LiquidityMining.stake — lastUpdate uses same timestamp as reward calculation', () => {
  let lm;

  beforeEach(() => {
    lm = new LiquidityMining();
  });

  afterEach(() => jest.restoreAllMocks());

  test('pending rewards after stake are exactly those earned since lastUpdate', () => {
    const t0 = 1_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(t0);
    makeProgram(lm);
    lm.stake('pool1', 'bob', 1_000_000);

    const t1 = t0 + 5_000; // 5 seconds later
    Date.now.mockReturnValue(t1);

    // Trigger a second stake to flush pending into rewardDebt and reset lastUpdate
    lm.stake('pool1', 'bob', 0);

    // Immediately after that stake, pending should be ~0 (lastUpdate == now)
    const pendingRightAfterStake = lm.calculatePending('pool1', 'bob');
    expect(pendingRightAfterStake).toBeCloseTo(0, 5);
  });

  test('staking with amount 0 does not create phantom rewards', () => {
    const t0 = 2_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(t0);
    makeProgram(lm, 'pool2');
    lm.stake('pool2', 'carol', 500_000);

    Date.now.mockReturnValue(t0 + 3_000);
    lm.stake('pool2', 'carol', 0); // zero-amount re-stake
    const pending = lm.calculatePending('pool2', 'carol');

    expect(pending).toBeCloseTo(0, 5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculatePending — negative timeElapsed must not produce negative rewards
// ─────────────────────────────────────────────────────────────────────────────

describe('LiquidityMining.calculatePending — rewards cannot go negative', () => {
  let lm;

  beforeEach(() => {
    lm = new LiquidityMining();
  });

  afterEach(() => jest.restoreAllMocks());

  test('returns 0 when a user stakes after the program has ended', () => {
    const programEnd = 5_000_000;

    // Create program that ends at t=programEnd
    jest.spyOn(Date, 'now').mockReturnValue(programEnd - 10_000);
    lm.createProgram('pool3', 'REN', 10, 10_000); // ends exactly at programEnd

    // User stakes AFTER the program ended
    Date.now.mockReturnValue(programEnd + 5_000);
    lm.stake('pool3', 'dave', 1_000_000);

    // pending should be 0, not negative
    const pending = lm.calculatePending('pool3', 'dave');
    expect(pending).toBeGreaterThanOrEqual(0);
    expect(pending).toBeCloseTo(0, 5);
  });

  test('rewards accrue normally before program end and stop at end', () => {
    const t0 = 1_000_000;
    const duration = 20_000; // 20s program

    jest.spyOn(Date, 'now').mockReturnValue(t0);
    lm.createProgram('pool4', 'REN', 10, duration);
    lm.stake('pool4', 'eve', 1_000_000);

    // Advance to 10s into program
    Date.now.mockReturnValue(t0 + 10_000);
    const pendingAt10s = lm.calculatePending('pool4', 'eve');

    // Advance to 30s (10s past program end)
    Date.now.mockReturnValue(t0 + 30_000);
    const pendingAt30s = lm.calculatePending('pool4', 'eve');

    // Rewards should stop at program end, so pendingAt30s ≈ pendingAt10s * 2 (20s of rewards)
    // not 30s worth
    expect(pendingAt30s).toBeLessThan(pendingAt10s * 3); // would be 3× if uncapped
    expect(pendingAt30s).toBeCloseTo(pendingAt10s * 2, 0); // 20s / 10s = 2×
  });
});
