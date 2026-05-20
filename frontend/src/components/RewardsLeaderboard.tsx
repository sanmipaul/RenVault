import React from 'react';

export interface LeaderboardEntry {
  rank: number;
  staker: string;
  total: number;
}

interface Props {
  entries: LeaderboardEntry[];
  maxRows?: number;
}

export function RewardsLeaderboard({ entries, maxRows = 10 }: Props) {
  const rows = entries.slice(0, maxRows);

  if (rows.length === 0) {
    return <p className="leaderboard--empty">No earners to display yet.</p>;
  }

  return (
    <div className="leaderboard">
      <h4 className="leaderboard__title">Top Earners</h4>
      <ol className="leaderboard__list">
        {rows.map(e => (
          <li key={e.staker} className="leaderboard__item">
            <span className="leaderboard__rank">#{e.rank}</span>
            <span className="leaderboard__address" title={e.staker}>
              {e.staker.slice(0, 6)}…{e.staker.slice(-4)}
            </span>
            <span className="leaderboard__total">{e.total.toLocaleString()} µSTX</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default RewardsLeaderboard;
