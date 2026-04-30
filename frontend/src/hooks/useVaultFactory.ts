import { useState, useEffect, useCallback } from 'react';
import { VaultFactoryService } from '../services/VaultFactoryService';
import { useWallet } from './useWallet';

export interface UseVaultFactoryResult {
  hasVault: boolean;
  vaultId: number | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Returns the current user's vault status from the vault-factory contract.
 *
 * Callers should check `hasVault` before offering a "Create Vault" action —
 * the contract now rejects duplicate creation with err-vault-exists (u201),
 * so surfacing this in the UI prevents a confusing error for users.
 */
export function useVaultFactory(): UseVaultFactoryResult {
  const { isConnected, connectionState } = useWallet();
  const [hasVault, setHasVault] = useState(false);
  const [vaultId, setVaultId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const address = connectionState?.address;
    if (!isConnected || !address) {
      setHasVault(false);
      setVaultId(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const service = VaultFactoryService.getInstance();
      const [exists, id] = await Promise.all([
        service.hasVault(address),
        service.getUserVaultId(address),
      ]);
      setHasVault(exists);
      setVaultId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vault status');
    } finally {
      setLoading(false);
    }
  }, [isConnected, connectionState?.address]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { hasVault, vaultId, loading, error, refresh };
}
