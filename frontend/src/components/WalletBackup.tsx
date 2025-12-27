// Wallet Backup Component
import React, { useState } from 'react';
import { WalletManager } from '../services/wallet/WalletManager';

interface WalletBackupProps {
  walletManager: WalletManager;
  onBackupComplete: (backupData: string) => void;
  onCancel: () => void;
}

export const WalletBackup: React.FC<WalletBackupProps> = ({ walletManager, onBackupComplete, onCancel }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateBackup = async () => {
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const backupData = await walletManager.createBackup(password);
      onBackupComplete(backupData);
    } catch (error) {
      setError('Failed to create backup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-backup">
      <h3>🛡️ Create Wallet Backup</h3>
      <p>Create a secure backup of your wallet. This will encrypt your recovery phrase.</p>

      <div className="form-group">
        <label htmlFor="backup-password">Password:</label>
        <input
          id="backup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter a strong password"
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirm-password">Confirm Password:</label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="button-group">
        <button onClick={handleCreateBackup} disabled={loading}>
          {loading ? 'Creating Backup...' : 'Create Backup'}
        </button>
        <button onClick={onCancel} className="cancel-btn">
          Cancel
        </button>
      </div>
    </div>
  );
};