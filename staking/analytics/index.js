// Analytics sub-package barrel
'use strict';

const { RewardsHistory } = require('../rewardsHistory');
const { RewardsAnalytics } = require('../rewardsAnalytics');
const { StakingStats } = require('../stakingStats');
const { RewardsExporter } = require('../rewardsExporter');

/**
 * Factory: create a fully-wired analytics suite from a StakingManager instance.
 * @param {import('../stakingManager').StakingManager} stakingManager
 */
function createAnalyticsSuite(stakingManager) {
  const history = new RewardsHistory();
  const analytics = new RewardsAnalytics(history);
  const stats = new StakingStats(stakingManager, history);
  const exporter = new RewardsExporter(history);
  return { history, analytics, stats, exporter };
}

module.exports = { RewardsHistory, RewardsAnalytics, StakingStats, RewardsExporter, createAnalyticsSuite };
