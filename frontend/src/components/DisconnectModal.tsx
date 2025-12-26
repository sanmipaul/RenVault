// components/DisconnectModal.tsx
import React from 'react';

interface DisconnectModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onLogout: () => void;
  providerName: string;
}

const DisconnectModal: React.FC<DisconnectModalProps> = ({ isOpen, onConfirm, onCancel, onLogout, providerName }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Disconnect Wallet</h3>
        <p>Are you sure you want to disconnect from {providerName}? This will clear your session and you will need to reconnect to perform transactions.</p>
        <div className="modal-actions">
          <button onClick={onCancel} className="cancel-btn">Cancel</button>
          <button onClick={onConfirm} className="confirm-btn">Disconnect</button>
          <button onClick={onLogout} className="logout-btn">Logout & Clear All</button>
        </div>
      </div>
    </div>
  );
};

export default DisconnectModal;