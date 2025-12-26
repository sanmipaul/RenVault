// hooks/useWallet.ts
import { useWalletContext } from '../context/WalletProvider';

export const useWallet = () => {
  return useWalletContext();
};
