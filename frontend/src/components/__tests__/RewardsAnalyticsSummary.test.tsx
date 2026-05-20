import React from 'react';
import { render, screen } from '@testing-library/react';
import { RewardsAnalyticsSummary } from '../RewardsAnalyticsSummary';
import { RewardEntry } from '../../services/RewardsHistoryService';

jest.mock('../../utils/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const ENTRIES: RewardEntry[] = [
  { epoch: 1, staker: 'SP1', amount: 300, type: 'distribution', timestamp: 1000 },
  { epoch: 2, staker: 'SP1', amount: 700, type: 'claim', timestamp: 2000 },
];

describe('RewardsAnalyticsSummary', () => {
  it('renders empty state when no entries', () => {
    render(<RewardsAnalyticsSummary entries={[]} />);
    expect(screen.getByText(/No reward data available/i)).toBeDefined();
  });

  it('shows total earned', () => {
    render(<RewardsAnalyticsSummary entries={ENTRIES} />);
    expect(screen.getByText(/1,000 µSTX/)).toBeDefined();
  });

  it('shows event count', () => {
    render(<RewardsAnalyticsSummary entries={ENTRIES} />);
    expect(screen.getByText('2')).toBeDefined();
  });

  it('shows peak reward amount', () => {
    render(<RewardsAnalyticsSummary entries={ENTRIES} />);
    expect(screen.getByText(/700 µSTX/)).toBeDefined();
  });

  it('shows by-type breakdown', () => {
    render(<RewardsAnalyticsSummary entries={ENTRIES} />);
    expect(screen.getByText(/distribution/i)).toBeDefined();
    expect(screen.getByText(/claim/i)).toBeDefined();
  });
});
