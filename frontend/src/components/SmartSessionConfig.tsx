import React, { useState, useEffect } from 'react';
import { SmartSessionConfig, SessionPermission, SessionConstraints, SpendingLimit } from '../types/smartsessions';
import { smartSessionService } from '../services/session/smart-session.service';

interface SmartSessionConfigProps {
  onSessionCreated?: (session: SmartSessionConfig) => void;
  walletAddress?: string;
}

const SmartSessionConfigComponent: React.FC<SmartSessionConfigProps> = ({ onSessionCreated, walletAddress }) => {
  const [duration, setDuration] = useState<number>(7 * 24 * 60 * 60 * 1000); // 7 days default
  const [spendingAmount, setSpendingAmount] = useState<string>('1000');
  const [maxTransactionsPerDay, setMaxTransactionsPerDay] = useState<number>(10);
  const [allowedOperations, setAllowedOperations] = useState<SessionPermission[]>([
    SessionPermission.VAULT_DEPOSIT,
  ]);
  const [requiresConfirmation, setRequiresConfirmation] = useState<boolean>(false);
  const [allowBatching, setAllowBatching] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleOperationToggle = (operation: SessionPermission) => {
    setAllowedOperations((prev) =>
      prev.includes(operation) ? prev.filter((op) => op !== operation) : [...prev, operation]
    );
  };

  const handleCreateSession = async () => {
    if (!walletAddress) {
      setError('Wallet address not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const spendingLimit: SpendingLimit = {
        amount: (BigInt(spendingAmount) * BigInt(1000000)).toString(), // Convert to microSTX
        currency: 'STX',
        resetPeriod: 'session',
      };

      const constraints: SessionConstraints = {
        maxTransactionsPerDay,
        operationWhitelist: allowedOperations,
        requiresConfirmation,
        allowBatching,
      };

      const session = smartSessionService.createSession({
        duration,
        spendingLimit,
        constraints,
        walletAddress,
      });

      setLoading(false);
      if (onSessionCreated) {
        onSessionCreated(session);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      setLoading(false);
    }
  };

  return (
    <div className="smart-session-config">
      <h3>Create Smart Session</h3>
      
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>Session Duration</label>
        <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
          <option value={1 * 24 * 60 * 60 * 1000}>1 Day</option>
          <option value={7 * 24 * 60 * 60 * 1000}>7 Days</option>
          <option value={30 * 24 * 60 * 60 * 1000}>30 Days</option>
          <option value={90 * 24 * 60 * 60 * 1000}>90 Days</option>
        </select>
      </div>

      <div className="form-group">
        <label>Spending Limit (STX)</label>
        <input
          type="number"
          value={spendingAmount}
          onChange={(e) => setSpendingAmount(e.target.value)}
          placeholder="1000"
        />
      </div>

      <div className="form-group">
        <label>Max Transactions Per Day</label>
        <input
          type="number"
          value={maxTransactionsPerDay}
          onChange={(e) => setMaxTransactionsPerDay(Number(e.target.value))}
          min="1"
          max="100"
        />
      </div>

      <div className="form-group">
        <label>Allowed Operations</label>
        <div className="operations-list">
          {Object.values(SessionPermission).map((op) => (
            <label key={op} className="checkbox-label">
              <input
                type="checkbox"
                checked={allowedOperations.includes(op)}
                onChange={() => handleOperationToggle(op)}
              />
              {op}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group checkbox">
        <label>
          <input
            type="checkbox"
            checked={requiresConfirmation}
            onChange={(e) => setRequiresConfirmation(e.target.checked)}
          />
          Require Confirmation for Each Transaction
        </label>
      </div>

      <div className="form-group checkbox">
        <label>
          <input
            type="checkbox"
            checked={allowBatching}
            onChange={(e) => setAllowBatching(e.target.checked)}
          />
          Allow Batch Operations
        </label>
      </div>

      <button onClick={handleCreateSession} disabled={loading} className="create-button">
        {loading ? 'Creating...' : 'Create Session'}
      </button>
    </div>
  );
};

export default SmartSessionConfigComponent;
