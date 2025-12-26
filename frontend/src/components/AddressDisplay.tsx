// components/AddressDisplay.tsx
import React, { useState } from 'react';
import { truncateAddress, copyToClipboard } from '../utils/address';

interface AddressDisplayProps {
  address: string;
  className?: string;
  showCopyButton?: boolean;
  truncate?: boolean;
}

const AddressDisplay: React.FC<AddressDisplayProps> = ({
  address,
  className = '',
  showCopyButton = true,
  truncate = true
}) => {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const displayAddress = truncate ? truncateAddress(address) : address;

  const handleCopy = async () => {
    const success = await copyToClipboard(address);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`address-display ${className}`}>
      <span
        className="address-text"
        title={address}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {displayAddress}
      </span>
      {showTooltip && truncate && (
        <div className="address-tooltip">
          {address}
        </div>
      )}
      {showCopyButton && (
        <button
          className="copy-button"
          onClick={handleCopy}
          title="Copy address"
        >
          {copied ? '✓' : '📋'}
        </button>
      )}
    </div>
  );
};

export default AddressDisplay;