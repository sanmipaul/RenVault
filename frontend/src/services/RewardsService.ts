/**
 * RewardsService
 *
 * Read-only queries against the rewards.clar contract.
 * All write operations (set-milestone-reward, add-to-reward-pool,
 * claim-milestone-reward) go through the standard TransactionService flow.
 */
import { callReadOnlyFunction, cvToJSON, uintCV, principalCV } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { environment } from '../config/environment';

const network = new StacksMainnet();
const CONTRACT_ADDRESS = environment.contracts.renVaultAddress;
const REWARDS_CONTRACT = 'rewards';

export interface MilestoneInfo {
  points: number;
  rewardAmount: number;
  claimed: boolean;
}

export class RewardsService {
  private static instance: RewardsService;

  static getInstance(): RewardsService {
    if (!RewardsService.instance) {
      RewardsService.instance = new RewardsService();
    }
    return RewardsService.instance;
  }

  /** Returns the STX reward configured for a given points milestone (0 if not set). */
  async getMilestoneReward(points: number): Promise<number> {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: REWARDS_CONTRACT,
        functionName: 'get-milestone-reward',
        functionArgs: [uintCV(points)],
        network,
        senderAddress: CONTRACT_ADDRESS,
      });
      const json = cvToJSON(result);
      return json.value?.value ?? 0;
    } catch {
      return 0;
    }
  }

  /** Returns true when `user` has already claimed the given `points` milestone. */
  async hasClaimedMilestone(user: string, points: number): Promise<boolean> {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: REWARDS_CONTRACT,
        functionName: 'has-claimed-milestone',
        functionArgs: [principalCV(user), uintCV(points)],
        network,
        senderAddress: user,
      });
      const json = cvToJSON(result);
      return json.value?.value === true;
    } catch {
      return false;
    }
  }

  /** Returns the total accumulated rewards for a user (sum across all milestones). */
  async getUserRewards(user: string): Promise<number> {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: REWARDS_CONTRACT,
        functionName: 'get-user-rewards',
        functionArgs: [principalCV(user)],
        network,
        senderAddress: user,
      });
      const json = cvToJSON(result);
      return json.value?.value ?? 0;
    } catch {
      return 0;
    }
  }

  /** Returns the current reward-pool balance (in micro-STX). */
  async getRewardPool(): Promise<number> {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: REWARDS_CONTRACT,
        functionName: 'get-reward-pool',
        functionArgs: [],
        network,
        senderAddress: CONTRACT_ADDRESS,
      });
      const json = cvToJSON(result);
      return json.value?.value ?? 0;
    } catch {
      return 0;
    }
  }

  /**
   * Fetches full info for a set of milestones for a given user.
   * Useful for rendering a milestone progress UI.
   */
  async getMilestoneInfoForUser(user: string, pointThresholds: number[]): Promise<MilestoneInfo[]> {
    return Promise.all(
      pointThresholds.map(async (points) => {
        const [rewardAmount, claimed] = await Promise.all([
          this.getMilestoneReward(points),
          this.hasClaimedMilestone(user, points),
        ]);
        return { points, rewardAmount, claimed };
      })
    );
  }
}

export default RewardsService;
