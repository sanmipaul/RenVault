// types/app.ts
import { StacksNetwork } from '@stacks/network';
import { ClarityValue } from '@stacks/transactions';

export type ConnectionMethod = 'stacks' | 'walletconnect' | null;
export type NetworkType = 'mainnet' | 'testnet';

export interface WithdrawTxDetails {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: ClarityValue[];
  network: StacksNetwork;
  amount: number;
  currentBalance: string;
  remainingBalance: string;
  fee: string;
  estimatedFee: string;
}

export interface WalletConnectSessionAccount {
  address: string;
  chainId: string;
}

export interface WalletConnectSession {
  namespaces: {
    stacks?: {
      accounts: string[];
    };
  };
  topic: string;
  expiry: number;
}

export interface AppUserProfile {
  profile: {
    stxAddress: {
      mainnet: string;
      testnet: string;
    };
    name?: string;
  };
  appPrivateKey: string;
}
