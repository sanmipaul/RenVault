// Two-Factor Authentication Setup Component
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import './TwoFactorAuth.css';

interface TwoFactorAuthProps {
  onSetupComplete: (secret: string, backupCodes: string[]) => void;
  onCancel: () => void;
}

export const TwoFactorAuthSetup: React.FC<TwoFactorAuthProps> = ({ onSetupComplete, onCancel }) => {
  const [step, setStep] = useState<'generate' | 'verify' | 'backup'>('generate');
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    generateSecret();
  }, []);

  const generateSecret = async () => {
    try {
      const response = await fetch('/api/2fa/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current-user' })
      });
      const data = await response.json();
      setSecret(data.secret);
      setQrCodeUrl(data.qrCodeUrl);
    } catch (error) {
      setError('Failed to generate 2FA secret');
    }
  };

  const verifyCode = async () => {
    try {
      const response = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, code: verificationCode })
      });
      if (response.ok) {
        setStep('backup');
        generateBackupCodes();
      } else {
        setError('Invalid verification code');
      }
    } catch (error) {
      setError('Verification failed');
    }
  };

  const generateBackupCodes = async () => {
    try {
      const response = await fetch('/api/2fa/backup-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current-user' })
      });
      const data = await response.json();
      setBackupCodes(data.backupCodes);
    } catch (error) {
      setError('Failed to generate backup codes');
    }
  };

  const completeSetup = () => {
    onSetupComplete(secret, backupCodes);
  };

  return (
    <div className="tfa-setup">
      <h3>🔐 Set up Two-Factor Authentication</h3>

      {step === 'generate' && (
        <div className="tfa-step">
          <p>Scan this QR code with your authenticator app:</p>
          {qrCodeUrl && <QRCode value={qrCodeUrl} size={200} />}
          <p>Or enter this secret manually: <code>{secret}</code></p>
          <button onClick={() => setStep('verify')} className="btn btn-primary">
            Next: Verify Code
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div className="tfa-step">
          <p>Enter the 6-digit code from your authenticator app:</p>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="000000"
            maxLength={6}
            className="tfa-input"
          />
          {error && <p className="error">{error}</p>}
          <div className="tfa-actions">
            <button onClick={() => setStep('generate')} className="btn btn-secondary">
              Back
            </button>
            <button onClick={verifyCode} className="btn btn-primary">
              Verify
            </button>
          </div>
        </div>
      )}

      {step === 'backup' && (
        <div className="tfa-step">
          <p>Save these backup codes in a safe place. You can use them to access your account if you lose your device:</p>
          <div className="backup-codes">
            {backupCodes.map((code, index) => (
              <code key={index} className="backup-code">{code}</code>
            ))}
          </div>
          <p className="warning">⚠️ Each code can only be used once. Store them securely!</p>
          <button onClick={completeSetup} className="btn btn-primary">
            Complete Setup
          </button>
        </div>
      )}

      <button onClick={onCancel} className="btn btn-outline tfa-cancel">
        Cancel Setup
      </button>
    </div>
  );
};