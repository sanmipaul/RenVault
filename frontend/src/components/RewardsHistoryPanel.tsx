import React, { useState } from 'react';
import { useRewardsHistory } from '../hooks/useRewardsHistory';
import { RewardEntry } from '../services/RewardsHistoryService';

interface Props {
  staker: string | null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LoadingRow() {
  return (
    <tr>
      <td colSpan={5} style={{ textAlign: 'center', padding: '1rem' }}>
        Loading rewards…
      </td>
    </tr>
  );
}

function EmptyRow() {
  return (
    <tr>
      <td colSpan={5} style={{ textAlign: 'center', padding: '1rem', color: '#888' }}>
        No reward history found.
      </td>
    </tr>
  );
}

function ErrorRow({ message }: { message: string }) {
  return (
    <tr>
      <td
        colSpan={5}
        style={{ textAlign: 'center', padding: '1rem', color: '#c0392b' }}
      >
        Error: {message}
      </td>
    </tr>
  );
}

export function RewardsHistoryPanel({ staker }: Props) {
  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(20);
  const { entries, page, loading, error, refresh } = useRewardsHistory(
    staker,
    pageNum,
    pageSize
  );

  return (
    <div className="rewards-history-panel">
      <div className="rewards-history-panel__header">
        <h3>Rewards History</h3>
        <button onClick={refresh} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <table className="rewards-history-panel__table">
        <thead>
          <tr>
            <th>Epoch</th>
            <th>Amount (µSTX)</th>
            <th>Type</th>
            <th>Date</th>
            <th>Staker</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <LoadingRow />
          ) : error ? (
            <ErrorRow message={error} />
          ) : entries.length === 0 ? (
            <EmptyRow />
          ) : (
            entries.map(e => <RewardRow key={e.epoch} entry={e} />)
          )}
        </tbody>
      </table>

      {page && page.totalPages > 1 && (
        <PaginationControls
          page={page.page}
          totalPages={page.totalPages}
          onPrev={() => setPageNum(p => Math.max(1, p - 1))}
          onNext={() => setPageNum(p => Math.min(page.totalPages, p + 1))}
        />
      )}
    </div>
  );
}

// ─── RewardRow ────────────────────────────────────────────────────────────────

function RewardRow({ entry }: { entry: RewardEntry }) {
  const date = new Date(entry.timestamp).toLocaleDateString();
  const short = entry.staker.slice(0, 8) + '…' + entry.staker.slice(-4);
  return (
    <tr>
      <td>{entry.epoch}</td>
      <td>{entry.amount.toLocaleString()}</td>
      <td>
        <span className={`badge badge--${entry.type}`}>{entry.type}</span>
      </td>
      <td>{date}</td>
      <td title={entry.staker}>{short}</td>
    </tr>
  );
}

// ─── PaginationControls ───────────────────────────────────────────────────────

function PaginationControls({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="rewards-history-panel__pagination">
      <button onClick={onPrev} disabled={page <= 1}>
        ← Prev
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button onClick={onNext} disabled={page >= totalPages}>
        Next →
      </button>
    </div>
  );
}

export default RewardsHistoryPanel;
