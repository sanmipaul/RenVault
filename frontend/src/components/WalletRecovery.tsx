// Wallet Recovery Component
import React, { useState } from 'react';
import { WalletManager } from '../services/wallet/WalletManager';

interface WalletRecoveryProps {
  walletManager: WalletManager;
  onRecoveryComplete: () => void;
  onCancel: () => void;
}

export const WalletRecovery: React.FC<WalletRecoveryProps> = ({ walletManager, onRecoveryComplete, onCancel }) => {
  const [backupData, setBackupData] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRecover = async () => {
    if (!backupData || !password) {
      setError('Please provide backup data and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await walletManager.recoverFromBackup(backupData, password);
      onRecoveryComplete();
    } catch (error) {
      setError('Recovery failed. Please check your backup data and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-recovery">
      <h3>🔄 Recover Wallet</h3>
      <p>Paste your encrypted backup data and enter the password to recover your wallet.</p>

      <div className="form-group">
        <label htmlFor="backup-data">Backup Data:</label>
        <textarea
          id="backup-data"
          value={backupData}
          onChange={(e) => setBackupData(e.target.value)}
          placeholder="Paste your backup data here"
          rows={5}
        />
      </div>

      <div className="form-group">
        <label htmlFor="recovery-password">Password:</label>
        <input
          id="recovery-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your backup password"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="button-group">
        <button onClick={handleRecover} disabled={loading}>
          {loading ? 'Recovering...' : 'Recover Wallet'}
        </button>
        <button onClick={onCancel} className="cancel-btn">
          Cancel
        </button>
      </div>
    </div>
  );
};