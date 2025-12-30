import React, { useState } from 'react';
import '../styles/onramp.css';
import { onRampService } from '../services/onramp-service';
import { BalanceService } from '../services/balance/BalanceService';
import { useWallet } from '../hooks/useWallet';

const BuySTXButton: React.FC = () => {
  const { connectionState } = useWallet();
  const [processing, setProcessing] = useState(false);

  const handleBuy = async () => {
    if (!connectionState?.address) return;
    setProcessing(true);
    const win = onRampService.openOnRampWindow({ address: connectionState.address, currency: 'STX' });
    if (!win) {
      setProcessing(false);
      return;
    }

    // Wait for balance change as a proxy for successful purchase
    const success = await onRampService.waitForOnRampSuccess(connectionState.address);
    if (success) {
      // Refresh balance immediately
      try {
        await BalanceService.getInstance().getBalance(connectionState.address, null as any);
      } catch (err) {
        // ignore
      }
    }

    // Close popup if still open
    try {
      win.close();
    } catch (err) {}
    setProcessing(false);
  };

  return (
    <button className="buy-stx-button" onClick={handleBuy} disabled={processing}>
      {processing ? 'Processing...' : 'Buy STX'}
    </button>
  );
};

export default BuySTXButton;
