import { TransactionDetails } from '../services/transaction/TransactionService';

export const validateTransactionAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 1000000 && Number.isFinite(amount);
};

export const validateContractAddress = (address: string): boolean => {
  // contractAddress must be a pure Stacks principal (no contract-name suffix).
  // The contract name lives in TransactionDetails.contractName.
  return /^(SP|SM|ST)[0-9A-Z]{26,28}$/.test(address);
};

export const validateContractName = (name: string): boolean => {
  return /^[a-z0-9-]+$/.test(name);
};

export const validateTransactionDetails = (details: TransactionDetails): string[] => {
  const errors: string[] = [];
  if (!details.contractAddress) errors.push('Contract address is required');
  if (!validateContractAddress(details.contractAddress)) errors.push('Invalid contract address');
  if (!details.contractName) errors.push('Contract name is required');
  if (!validateContractName(details.contractName)) errors.push('Invalid contract name format');
  if (!details.functionName) errors.push('Function name is required');
  if (!validateTransactionAmount(details.amount)) errors.push('Invalid transaction amount');
  return errors;
};
