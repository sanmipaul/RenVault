// components/HelpPanel.tsx
import React from 'react';

interface HelpPanelProps {
  onClose: () => void;
}

const HelpPanel: React.FC<HelpPanelProps> = ({ onClose }) => {
  return (
    <div className="card">
      <h3>Connection Help</h3>
      <p>
        <strong>Stacks Wallet Extension:</strong> Make sure you have the Stacks Wallet browser
        extension installed and unlocked.
      </p>
      <p>
        <strong>WalletConnect:</strong> Ensure your mobile wallet app supports WalletConnect and is
        connected to the internet.
      </p>
      <p>
        <strong>Network Issues:</strong> Check your internet connection and try refreshing the page.
      </p>
      <p>
        <strong>Timeout Errors:</strong> The app will automatically retry connections. If it
        persists, try a different connection method.
      </p>
      <button className="btn btn-primary" onClick={onClose} style={{ marginTop: '16px' }}>
        Close Help
      </button>
    </div>
  );
};

export default HelpPanel;
