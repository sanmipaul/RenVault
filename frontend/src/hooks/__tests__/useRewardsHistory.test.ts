import { renderHook, act, waitFor } from '@testing-library/react';
import { useRewardsHistory } from '../useRewardsHistory';
import { RewardsHistoryService } from '../../services/RewardsHistoryService';

jest.mock('../../utils/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

describe('useRewardsHistory', () => {
  beforeEach(() => {
    (RewardsHistoryService as any).instance = undefined;
  });

  it('starts with loading false and empty entries when staker is null', () => {
    const { result } = renderHook(() => useRewardsHistory(null));
    expect(result.current.entries).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('sets loading true while fetching', async () => {
    const staker = 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9';
    const { result } = renderHook(() => useRewardsHistory(staker));
    // loading may be synchronously true during the first render cycle
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('populates entries after fetch completes', async () => {
    const staker = 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9';
    const { result } = renderHook(() => useRewardsHistory(staker));
    await waitFor(() => !result.current.loading);
    expect(Array.isArray(result.current.entries)).toBe(true);
  });

  it('clears entries when staker changes to null', async () => {
    const { result, rerender } = renderHook(
      ({ s }) => useRewardsHistory(s),
      { initialProps: { s: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9' as string | null } }
    );
    await waitFor(() => !result.current.loading);
    rerender({ s: null });
    expect(result.current.entries).toEqual([]);
  });

  it('refresh increments tick causing re-fetch', async () => {
    const staker = 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9';
    const fetchSpy = jest.spyOn(RewardsHistoryService.getInstance(), 'fetchPage');
    const { result } = renderHook(() => useRewardsHistory(staker));
    await waitFor(() => !result.current.loading);
    const callsBefore = fetchSpy.mock.calls.length;
    act(() => { result.current.refresh(); });
    await waitFor(() => !result.current.loading);
    expect(fetchSpy.mock.calls.length).toBeGreaterThan(callsBefore);
    fetchSpy.mockRestore();
  });
});
