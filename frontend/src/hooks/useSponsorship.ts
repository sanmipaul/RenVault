import { useState, useCallback } from 'react';
import { useWalletContext } from '../context/WalletProvider';
import SponsorshipService from '../services/SponsorshipService';

export const useSponsorship = () => {
  const { sponsorshipQuota, isEligibleForSponsorship } = useWalletContext();
  const [isSponsoring, setIsSponsoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEligibility = useCallback(async (operation: string, value?: number) => {
    return await isEligibleForSponsorship(operation, value);
  }, [isEligibleForSponsorship]);

  const getSponsorshipData = useCallback(async (txData: any) => {
    setIsSponsoring(true);
    setError(null);
    try {
      const service = SponsorshipService.getInstance();
      const data = await service.getPaymasterData(txData);
      return data;
    } catch (err: any) {
      const service = SponsorshipService.getInstance();
      const message = service.handleSponsorshipError(err);
      setError(message);
      return null;
    } finally {
      setIsSponsoring(false);
    }
  }, []);

  const trackSuccess = useCallback(async (txHash: string, operation: string) => {
    const service = SponsorshipService.getInstance();
    await service.trackSponsorship(txHash, operation);
  }, []);

  return {
    quota: sponsorshipQuota,
    isSponsoring,
    error,
    checkEligibility,
    getSponsorshipData,
    trackSuccess
  };
};
