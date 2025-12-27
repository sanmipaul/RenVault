// MultiSigSetup Component
import React, { useState } from 'react';
import { WalletManager } from '../services/wallet/WalletManager';

interface MultiSigSetupProps {
  walletManager: WalletManager;
  onSetupComplete: () => void;
  onCancel: () => void;
}

export const MultiSigSetup: React.FC<MultiSigSetupProps> = ({ walletManager, onSetupComplete, onCancel }) => {
  const [threshold, setThreshold] = useState<number>(2);
  const [coSigners, setCoSigners] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addCoSigner = () => {
    setCoSigners([...coSigners, '']);
  };

  const removeCoSigner = (index: number) => {
    setCoSigners(coSigners.filter((_, i) => i !== index));
  };

  const updateCoSigner = (index: number, address: string) => {
    const updated = [...coSigners];
    updated[index] = address;
    setCoSigners(updated);
  };

  const handleSetup = async () => {
    const validCoSigners = coSigners.filter(addr => addr.trim() !== '');
    if (validCoSigners.length === 0) {
      setError('At least one co-signer is required');
      return;
    }

    if (threshold > validCoSigners.length + 1) {
      setError('Threshold cannot be greater than total signers');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const coSignerObjects = validCoSigners.map(address => ({
        address,
        publicKey: '', // Would be fetched in real implementation
        name: `Co-signer ${validCoSigners.indexOf(address) + 1}`
      }));

      walletManager.setupMultiSigWallet(threshold, coSignerObjects);
      onSetupComplete();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="multisig-setup">
      <h3>🔐 Setup Multi-Signature Wallet</h3>
      <p>Create a multi-signature wallet for enhanced security with shared control.</p>

      <div className="form-group">
        <label htmlFor="threshold">Signature Threshold:</label>
        <input
          id="threshold"
          type="number"
          min="1"
          max={coSigners.filter(c => c.trim()).length + 1}
          value={threshold}
          onChange={(e) => setThreshold(parseInt(e.target.value) || 1)}
        />
        <small>Number of signatures required to approve transactions</small>
      </div>

      <div className="form-group">
        <label>Co-Signers:</label>
        {coSigners.map((coSigner, index) => (
          <div key={index} className="co-signer-input">
            <input
              type="text"
              placeholder="Co-signer Stacks address"
              value={coSigner}
              onChange={(e) => updateCoSigner(index, e.target.value)}
            />
            {coSigners.length > 1 && (
              <button
                type="button"
                onClick={() => removeCoSigner(index)}
                className="remove-btn"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addCoSigner} className="add-btn">
          + Add Co-Signer
        </button>
      </div>

      <div className="summary">
        <p><strong>Total Signers:</strong> {coSigners.filter(c => c.trim()).length + 1} (including you)</p>
        <p><strong>Threshold:</strong> {threshold} signatures required</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="button-group">
        <button onClick={handleSetup} disabled={loading}>
          {loading ? 'Setting up...' : 'Setup Multi-Sig Wallet'}
        </button>
        <button onClick={onCancel} className="cancel-btn">
          Cancel
        </button>
      </div>
    </div>
  );
};