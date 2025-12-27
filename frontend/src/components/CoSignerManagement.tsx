// CoSignerManagement Component
import React, { useState, useEffect } from 'react';
import { WalletManager } from '../services/wallet/WalletManager';

interface CoSignerManagementProps {
  walletManager: WalletManager;
  onUpdate: () => void;
  onCancel: () => void;
}

export const CoSignerManagement: React.FC<CoSignerManagementProps> = ({ walletManager, onUpdate, onCancel }) => {
  const [coSigners, setCoSigners] = useState<any[]>([]);
  const [newCoSigner, setNewCoSigner] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const config = walletManager.getMultiSigConfig();
    if (config) {
      setCoSigners(config.coSigners);
    }
  }, [walletManager]);

  const handleAddCoSigner = async () => {
    if (!newCoSigner.trim()) {
      setError('Please enter a valid address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      walletManager.addCoSigner({
        address: newCoSigner.trim(),
        publicKey: '',
        name: `Co-signer ${coSigners.length + 1}`
      });
      setCoSigners(walletManager.getMultiSigConfig()?.coSigners || []);
      setNewCoSigner('');
      onUpdate();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoSigner = async (address: string) => {
    setLoading(true);
    setError('');

    try {
      walletManager.removeCoSigner(address);
      setCoSigners(walletManager.getMultiSigConfig()?.coSigners || []);
      onUpdate();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="co-signer-management">
      <h3>👥 Manage Co-Signers</h3>
      <p>Add or remove co-signers for your multi-signature wallet.</p>

      <div className="current-co-signers">
        <h4>Current Co-Signers:</h4>
        {coSigners.length === 0 ? (
          <p>No co-signers configured</p>
        ) : (
          <ul>
            {coSigners.map((coSigner, index) => (
              <li key={index} className="co-signer-item">
                <span>{coSigner.name || `Co-signer ${index + 1}`}</span>
                <span className="address">{coSigner.address}</span>
                <button
                  onClick={() => handleRemoveCoSigner(coSigner.address)}
                  className="remove-btn"
                  disabled={loading}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="add-co-signer">
        <h4>Add New Co-Signer:</h4>
        <div className="form-group">
          <input
            type="text"
            placeholder="Enter Stacks address"
            value={newCoSigner}
            onChange={(e) => setNewCoSigner(e.target.value)}
          />
          <button
            onClick={handleAddCoSigner}
            disabled={loading || !newCoSigner.trim()}
          >
            {loading ? 'Adding...' : 'Add Co-Signer'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="button-group">
        <button onClick={onCancel} className="cancel-btn">
          Close
        </button>
      </div>
    </div>
  );
};