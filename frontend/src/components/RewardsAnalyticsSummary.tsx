import React from 'react';
import { useRewardsAnalytics } from '../hooks/useRewardsAnalytics';
import { RewardEntry } from '../services/RewardsHistoryService';

interface Props {
  entries: RewardEntry[];
}

export function RewardsAnalyticsSummary({ entries }: Props) {
  const { total, count, average, peak, byType } = useRewardsAnalytics(entries);

  if (count === 0) {
    return <p className="rewards-analytics--empty">No reward data available.</p>;
  }

  return (
    <div className="rewards-analytics">
      <div className="rewards-analytics__stat">
        <span className="rewards-analytics__label">Total Earned</span>
        <span className="rewards-analytics__value">{total.toLocaleString()} µSTX</span>
      </div>
      <div className="rewards-analytics__stat">
        <span className="rewards-analytics__label">Events</span>
        <span className="rewards-analytics__value">{count}</span>
      </div>
      <div className="rewards-analytics__stat">
        <span className="rewards-analytics__label">Avg per Event</span>
        <span className="rewards-analytics__value">{Math.round(average).toLocaleString()} µSTX</span>
      </div>
      {peak && (
        <div className="rewards-analytics__stat">
          <span className="rewards-analytics__label">Peak Reward</span>
          <span className="rewards-analytics__value">{peak.amount.toLocaleString()} µSTX</span>
        </div>
      )}
      <div className="rewards-analytics__breakdown">
        <span className="rewards-analytics__label">By Type</span>
        <ul>
          {Object.entries(byType).map(([type, amount]) => (
            <li key={type}>
              <strong>{type}</strong>: {amount.toLocaleString()} µSTX
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default RewardsAnalyticsSummary;
