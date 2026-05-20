import React from 'react';
import { render, screen } from '@testing-library/react';
import { RewardsLeaderboard, LeaderboardEntry } from '../RewardsLeaderboard';

const ENTRIES: LeaderboardEntry[] = [
  { rank: 1, staker: 'SP1AAAAAAAAAAAAAAAAAAAAAA', total: 1000 },
  { rank: 2, staker: 'SP2BBBBBBBBBBBBBBBBBBBBB', total: 500 },
  { rank: 3, staker: 'SP3CCCCCCCCCCCCCCCCCCCCC', total: 200 },
];

describe('RewardsLeaderboard', () => {
  it('renders empty state when no entries', () => {
    render(<RewardsLeaderboard entries={[]} />);
    expect(screen.getByText(/No earners to display yet/i)).toBeDefined();
  });

  it('renders a list item for each entry', () => {
    render(<RewardsLeaderboard entries={ENTRIES} />);
    expect(screen.getAllByRole('listitem').length).toBe(3);
  });

  it('respects maxRows prop', () => {
    render(<RewardsLeaderboard entries={ENTRIES} maxRows={2} />);
    expect(screen.getAllByRole('listitem').length).toBe(2);
  });

  it('displays rank numbers', () => {
    render(<RewardsLeaderboard entries={ENTRIES} />);
    expect(screen.getByText('#1')).toBeDefined();
    expect(screen.getByText('#2')).toBeDefined();
  });

  it('displays formatted total amounts', () => {
    render(<RewardsLeaderboard entries={ENTRIES} />);
    expect(screen.getByText(/1,000 µSTX/)).toBeDefined();
  });
});
