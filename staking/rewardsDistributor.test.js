const { StakingManager } = require('./stakingManager');
const { RewardsDistributor } = require('./rewardsDistributor');

describe('RewardsDistributor', () => {
  let sm;
  let rd;
  const MIN = 1000000;

  beforeEach(() => {
    sm = new StakingManager();
    rd = new RewardsDistributor(sm);
  });

  afterEach(() => {
    if (rd.isRunning) rd.stop();
  });

  // start / stop
  describe('start / stop', () => {
    test('start sets isRunning to true', () => {
      rd.start();
      expect(rd.isRunning).toBe(true);
    });

    test('stop sets isRunning to false', () => {
      rd.start();
      rd.stop();
      expect(rd.isRunning).toBe(false);
    });

    test('calling start twice is idempotent', () => {
      rd.start();
      rd.start();
      expect(rd.isRunning).toBe(true);
    });

    test('calling stop when not running is safe', () => {
      expect(() => rd.stop()).not.toThrow();
    });
  });

  // distributeRewards
  describe('distributeRewards', () => {
    test('records a distribution entry each call', async () => {
      await rd.distributeRewards();
      expect(rd.distributionHistory.length).toBe(1);
    });

    test('distributes rewards to eligible stakers', async () => {
      sm.stake('alice', MIN);
      // Simulate 3 epochs elapsed
      sm.stakeTimestamps.set('alice', Date.now() - sm.lockPeriod * 3 - 1);

      const dist = await rd.distributeRewards();
      expect(dist.recipients).toBe(1);
      expect(dist.totalDistributed).toBeGreaterThan(0);
    });

    test('skips stakers with no pending rewards', async () => {
      sm.stake('alice', MIN); // freshly staked, 0 epochs elapsed
      const dist = await rd.distributeRewards();
      expect(dist.recipients).toBe(0);
      expect(dist.totalDistributed).toBe(0);
    });

    test('handles errors per-staker without aborting the whole distribution', async () => {
      // Inject a staker entry without a proper stake so claimRewards throws
      sm.stakes.set('broken', MIN);
      sm.stakeTimestamps.set('broken', Date.now() - sm.lockPeriod * 2 - 1);
      // Patch calculateRewards to throw for 'broken'
      const orig = sm.calculateRewards.bind(sm);
      sm.calculateRewards = (addr) => {
        if (addr === 'broken') throw new Error('simulated error');
        return orig(addr);
      };
      const dist = await rd.distributeRewards();
      const failEntry = dist.details.find(d => d.staker === 'broken');
      expect(failEntry.success).toBe(false);
    });
  });

  // getDistributionHistory
  describe('getDistributionHistory', () => {
    test('returns empty array initially', () => {
      expect(rd.getDistributionHistory()).toHaveLength(0);
    });

    test('returns history sorted newest first', async () => {
      await rd.distributeRewards();
      await rd.distributeRewards();
      const history = rd.getDistributionHistory();
      expect(history[0].timestamp).toBeGreaterThanOrEqual(history[1].timestamp);
    });

    test('respects limit parameter', async () => {
      for (let i = 0; i < 5; i++) await rd.distributeRewards();
      expect(rd.getDistributionHistory(3)).toHaveLength(3);
    });
  });

  // getDistributionStats
  describe('getDistributionStats', () => {
    test('returns zeroes before any distributions', () => {
      const stats = rd.getDistributionStats();
      expect(stats.totalDistributions).toBe(0);
      expect(stats.totalDistributed).toBe(0);
      expect(stats.lastDistribution).toBeNull();
    });

    test('returns correct totals after distributions', async () => {
      sm.stake('alice', MIN);
      sm.stakeTimestamps.set('alice', Date.now() - sm.lockPeriod * 2 - 1);
      await rd.distributeRewards();
      const stats = rd.getDistributionStats();
      expect(stats.totalDistributions).toBe(1);
      expect(stats.lastDistribution).not.toBeNull();
    });
  });

  // getStatus
  describe('getStatus', () => {
    test('reports running status correctly', () => {
      rd.start();
      const status = rd.getStatus();
      expect(status.isRunning).toBe(true);
      expect(status.distributionInterval).toBe(rd.distributionInterval);
      expect(status.nextDistribution).not.toBeNull();
    });

    test('nextDistribution is null when not running', () => {
      expect(rd.getStatus().nextDistribution).toBeNull();
    });
  });
});
