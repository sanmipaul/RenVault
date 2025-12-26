// Two-Factor Authentication Verification Component
import React, { useState } from 'react';
import './TwoFactorAuth.css';

interface TwoFactorAuthVerifyProps {
  onVerify: (code: string) => Promise<boolean>;
  onUseBackup: () => void;
  onCancel: () => void;
}

export const TwoFactorAuthVerify: React.FC<TwoFactorAuthVerifyProps> = ({
  onVerify,
  onUseBackup,
  onCancel
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await onVerify(code);
      if (!success) {
        setError('Invalid code. Please try again.');
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
    <div className="tfa-verify">
      <h3>🔐 Two-Factor Authentication</h3>
      <p>Enter the 6-digit code from your authenticator app:</p>

      <input
        type="text"
        value={code}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, '');
          setCode(value);
          if (error) setError('');
        }}
        onKeyPress={handleKeyPress}
        placeholder="000000"
        maxLength={6}
        className="tfa-input"
        autoFocus
      />

      {error && <p className="error">{error}</p>}

      <div className="tfa-actions">
        <button
          onClick={handleVerify}
          disabled={loading || code.length !== 6}
          className="btn btn-primary"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
        <button onClick={onUseBackup} className="btn btn-secondary">
          Use Backup Code
        </button>
        <button onClick={onCancel} className="btn btn-outline">
          Cancel
        </button>
      </div>
    </div>
  );
};