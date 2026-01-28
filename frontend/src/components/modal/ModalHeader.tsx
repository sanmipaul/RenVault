import React from 'react';

interface ModalHeaderProps {
  onClose: () => void;
  showNetworkIndicator?: boolean;
  networkStatus?: 'online' | 'congested' | 'offline';
}

const ModalHeader: React.FC<ModalHeaderProps> = ({
  onClose,
  showNetworkIndicator = true,
  networkStatus = 'online'
}) => {
  const getNetworkStatusColor = () => {
    switch (networkStatus) {
      case 'online':
        return '#10b981';
      case 'congested':
        return '#f59e0b';
      case 'offline':
        return '#ef4444';
      default:
        return '#10b981';
    }
  };

  const getNetworkStatusText = () => {
    switch (networkStatus) {
      case 'online':
        return 'Connected';
      case 'congested':
        return 'Congested';
      case 'offline':
        return 'Offline';
      default:
        return 'Connected';
    }
  };

  return (
    <div className="renvault-modal-header">
      <div className="renvault-modal-header__brand">
        <div className="renvault-modal-header__logo">
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="40" height="40" rx="10" fill="#4a80f5" />
            <path
              d="M12 14h16v3H12zM12 19h16v3H12zM12 24h12v3H12z"
              fill="white"
            />
            <circle cx="28" cy="25.5" r="4" fill="#10b981" />
          </svg>
        </div>
        <div className="renvault-modal-header__text">
          <h2 className="renvault-modal-header__title">RenVault</h2>
          <p className="renvault-modal-header__tagline">Connect to Your Vault</p>
        </div>
      </div>

      <div className="renvault-modal-header__actions">
        {showNetworkIndicator && (
          <div className="renvault-modal-header__network">
            <span
              className="renvault-modal-header__network-indicator"
              style={{ backgroundColor: getNetworkStatusColor() }}
            />
            <span className="renvault-modal-header__network-text">
              Stacks: {getNetworkStatusText()}
            </span>
          </div>
        )}
        <button
          className="renvault-modal-header__close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M15 5L5 15M5 5l10 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ModalHeader;
