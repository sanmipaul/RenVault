/**
 * VaultFactoryService
 *
 * Read-only helpers for the vault-factory.clar contract.
 * Mutable operations (create-vault, remove-vault) go through
 * the standard TransactionService flow.
 */
import { callReadOnlyFunction, cvToJSON, principalCV, uintCV } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { environment } from '../config/environment';

const network = new StacksMainnet();
const CONTRACT_ADDRESS = environment.contracts.renVaultAddress;
const VAULT_FACTORY = 'vault-factory';

export interface VaultMetadata {
  createdAt: number;
  owner: string;
}

export class VaultFactoryService {
  private static instance: VaultFactoryService;

  static getInstance(): VaultFactoryService {
    if (!VaultFactoryService.instance) {
      VaultFactoryService.instance = new VaultFactoryService();
    }
    return VaultFactoryService.instance;
  }

  /** Returns true when `user` already owns a vault. */
  async hasVault(user: string): Promise<boolean> {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: VAULT_FACTORY,
        functionName: 'has-vault',
        functionArgs: [principalCV(user)],
        network,
        senderAddress: user,
      });
      const json = cvToJSON(result);
      return json.value?.value === true;
    } catch {
      return false;
    }
  }

  /** Returns the vault-id for `user`, or null if they have no vault. */
  async getUserVaultId(user: string): Promise<number | null> {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: VAULT_FACTORY,
        functionName: 'get-user-vault',
        functionArgs: [principalCV(user)],
        network,
        senderAddress: user,
      });
      const json = cvToJSON(result);
      // ok(some(uint)) → json.value.value.value
      const vaultId = json.value?.value?.value;
      return vaultId !== undefined ? Number(vaultId) : null;
    } catch {
      return null;
    }
  }

  /** Returns the owner principal for a given vault-id, or null. */
  async getVaultOwner(vaultId: number): Promise<string | null> {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: VAULT_FACTORY,
        functionName: 'get-vault-owner',
        functionArgs: [uintCV(vaultId)],
        network,
        senderAddress: CONTRACT_ADDRESS,
      });
      const json = cvToJSON(result);
      return json.value?.value?.value ?? null;
    } catch {
      return null;
    }
  }

  /** Returns metadata for a given vault-id, or null. */
  async getVaultMetadata(vaultId: number): Promise<VaultMetadata | null> {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: VAULT_FACTORY,
        functionName: 'get-vault-metadata',
        functionArgs: [uintCV(vaultId)],
        network,
        senderAddress: CONTRACT_ADDRESS,
      });
      const json = cvToJSON(result);
      const data = json.value?.value?.value;
      if (!data) return null;
      return {
        createdAt: Number(data['created-at']?.value ?? 0),
        owner: data['owner']?.value ?? '',
      };
    } catch {
      return null;
    }
  }

  /** Returns the total number of vaults ever created. */
  async getVaultCount(): Promise<number> {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: VAULT_FACTORY,
        functionName: 'get-vault-count',
        functionArgs: [],
        network,
        senderAddress: CONTRACT_ADDRESS,
      });
      const json = cvToJSON(result);
      return Number(json.value?.value ?? 0);
    } catch {
      return 0;
    }
  }
}

export default VaultFactoryService;
