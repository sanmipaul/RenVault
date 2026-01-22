// Backup Codes Component
import React, { useState } from 'react';
import './TwoFactorAuth.css';

interface BackupCodesProps {
  onVerify: (code: string) => Promise<boolean>;
  onCancel: () => void;
}

export const BackupCodes: React.FC<BackupCodesProps> = ({ onVerify, onCancel }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code.trim()) {
      setError('Please enter a backup code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await onVerify(code.trim());
      if (!success) {
        setError('Invalid backup code. Please try again.');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleVerify();
    }
  };

  return (
    <div className="backup-codes-verify">
      <h3>🔑 Backup Code Verification</h3>
      <p>Enter one of your backup codes:</p>

      <input
        type="text"
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          if (error) setError('');
        }}
        onKeyPress={handleKeyPress}
        placeholder="Enter backup code"
        className="tfa-input"
        autoFocus
      />

      {error && <p className="error">{error}</p>}

      <div className="tfa-actions">
        <button
          onClick={handleVerify}
          disabled={loading || !code.trim()}
          className="btn btn-primary"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
        <button onClick={onCancel} className="btn btn-outline">
          Cancel
        </button>
      </div>

      <p className="info">
        💡 Backup codes are single-use. Make sure to generate new ones after using this method.
      </p>
    </div>
  );
};