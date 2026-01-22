import React from 'react';

interface OnRampModalProps {
  open: boolean;
  onClose: () => void;
  providerUrl?: string;
}

const OnRampModal: React.FC<OnRampModalProps> = ({ open, onClose, providerUrl }) => {
  if (!open) return null;

  return (
    <div className="onramp-modal-overlay">
      <div className="onramp-modal">
        <div className="onramp-header">
          <h3>Buy STX</h3>
          <button onClick={onClose}>Close</button>
        </div>
        <div className="onramp-body">
          <p>
            You will be redirected to the selected on-ramp provider to complete your purchase.
          </p>
          {providerUrl ? (
            <iframe title="onramp" src={providerUrl} style={{ width: '100%', height: '400px', border: 'none' }} />
          ) : (
            <div>No provider configured</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnRampModal;
