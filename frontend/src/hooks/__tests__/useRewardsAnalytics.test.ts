import { renderHook } from '@testing-library/react';
import { useRewardsAnalytics } from '../useRewardsAnalytics';
import { RewardEntry } from '../../services/RewardsHistoryService';

jest.mock('../../utils/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const ENTRIES: RewardEntry[] = [
  { epoch: 1, staker: 'SP1', amount: 100, type: 'distribution', timestamp: 1000 },
  { epoch: 2, staker: 'SP1', amount: 400, type: 'claim', timestamp: 2000 },
  { epoch: 3, staker: 'SP1', amount: 200, type: 'distribution', timestamp: 3000 },
];

describe('useRewardsAnalytics', () => {
  it('computes correct total', () => {
    const { result } = renderHook(() => useRewardsAnalytics(ENTRIES));
    expect(result.current.total).toBe(700);
  });

  it('computes correct count', () => {
    const { result } = renderHook(() => useRewardsAnalytics(ENTRIES));
    expect(result.current.count).toBe(3);
  });

  it('computes correct average', () => {
    const { result } = renderHook(() => useRewardsAnalytics(ENTRIES));
    expect(result.current.average).toBeCloseTo(700 / 3);
  });

  it('identifies the peak entry', () => {
    const { result } = renderHook(() => useRewardsAnalytics(ENTRIES));
    expect(result.current.peak?.amount).toBe(400);
  });

  it('returns null peak for empty entries', () => {
    const { result } = renderHook(() => useRewardsAnalytics([]));
    expect(result.current.peak).toBeNull();
  });

  it('aggregates by type correctly', () => {
    const { result } = renderHook(() => useRewardsAnalytics(ENTRIES));
    expect(result.current.byType['distribution']).toBe(300);
    expect(result.current.byType['claim']).toBe(400);
  });

  it('returns zeros for empty entries', () => {
    const { result } = renderHook(() => useRewardsAnalytics([]));
    expect(result.current.total).toBe(0);
    expect(result.current.count).toBe(0);
  });
});
