/**
 * Multi-Chain React Hooks
 * Custom hooks for multi-chain operations and state management
 */

import React, { useCallback, useEffect, useState } from 'react';
import { ChainSwitchService } from '../services/chain/ChainSwitchService';
import { MultiChainTransactionService } from '../services/chain/MultiChainTransactionService';
import { MultiChainBalanceService } from '../services/chain/MultiChainBalanceService';
import { MultiChainWalletProviderService } from '../services/chain/MultiChainWalletProviderService';
import { NetworkValidationService } from '../services/chain/NetworkValidationService';
import { MultiChainErrorHandler } from '../services/chain/MultiChainErrorHandler';
import type { ChainType } from '../config/multi-chain-config';

/**
 * useAsync Hook - Handle async operations with loading/error states
 */
export function useAsync<T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setValue(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setValue(response);
      setStatus('success');

      return response;
    } catch (error) {
      setError(error as E);
      setStatus('error');
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, value, error };
}

/**
 * useLocalStorage Hook - Sync state with localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);

      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);

      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
}

/**
 * usePrevious Hook - Get previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * useDebounce Hook - Debounce values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useChainInfo Hook - Get current chain information
 */
export function useChainInfo() {
  const [chainInfo, setChainInfo] = useState<ReturnType<typeof ChainSwitchService.getActiveChain> | null>(null);
  const [isStacks, setIsStacks] = useState(false);
  const [isEvm, setIsEvm] = useState(true);

  useEffect(() => {
    const updateChainInfo = () => {
      const chain = ChainSwitchService.getActiveChain();
      setChainInfo(chain);
      setIsStacks(ChainSwitchService.isStacksActive());
      setIsEvm(ChainSwitchService.isEvmActive());
    };

    updateChainInfo();

    const unsubscribe = ChainSwitchService.onChainSwitch(() => {
      updateChainInfo();
    });

    return unsubscribe;
  }, []);

  return { chainInfo, isStacks, isEvm };
}

/**
 * useAddressValidation Hook - Validate addresses
 */
export function useAddressValidation(address: string, chainType: ChainType) {
  const [isValid, setIsValid] = useState(false);
  const [normalized, setNormalized] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(() => {
    const result = NetworkValidationService.validateAddress(address, chainType);

    setIsValid(result.isValid);
    setNormalized(result.normalizedAddress || null);
    setError(result.error || null);

    return result;
  }, [address, chainType]);

  useEffect(() => {
    if (address) {
      validate();
    } else {
      setIsValid(false);
      setNormalized(null);
      setError(null);
    }
  }, [address, validate]);

  return { isValid, normalized, error, validate };
}

/**
 * useAmountValidation Hook - Validate amounts
 */
export function useAmountValidation(amount: string, chainType: ChainType) {
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    if (amount) {
      const result = NetworkValidationService.validateAmount(amount, chainType);

      setIsValid(result.isValid);
      setError(result.error || null);
      setWarnings(result.warnings || []);
    } else {
      setIsValid(false);
      setError(null);
      setWarnings([]);
    }
  }, [amount, chainType]);

  return { isValid, error, warnings };
}

/**
 * useTransactionTracking Hook - Track transactions
 */
export function useTransactionTracking(address?: string) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;

    setLoading(true);

    try {
      const txs = MultiChainTransactionService.getTransactionsByAddress(address);
      setTransactions(txs);
    } finally {
      setLoading(false);
    }
  }, [address]);

  const addTransaction = useCallback(
    (tx: any) => {
      const newTx = MultiChainTransactionService.createTransaction(tx);
      setTransactions(prev => [newTx, ...prev]);

      return newTx;
    },
    []
  );

  const updateStatus = useCallback((txId: string, status: string) => {
    MultiChainTransactionService.updateTransactionStatus(txId, status as any);
    setTransactions(prev =>
      prev.map(tx => (tx.id === txId ? { ...tx, status } : tx))
    );
  }, []);

  return { transactions, loading, addTransaction, updateStatus };
}

/**
 * useChainHealth Hook - Monitor chain health
 */
export function useChainHealth(chainType: ChainType) {
  const [isHealthy, setIsHealthy] = useState(true);
  const [checking, setChecking] = useState(false);

  const checkHealth = useCallback(async () => {
    setChecking(true);

    try {
      const result = await NetworkValidationService.isChainReachable(chainType);
      setIsHealthy(result.isValid);

      return result.isValid;
    } finally {
      setChecking(false);
    }
  }, [chainType]);

  useEffect(() => {
    checkHealth();

    const interval = setInterval(() => {
      checkHealth();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [chainType, checkHealth]);

  return { isHealthy, checking, checkHealth };
}

/**
 * useTransactionForm Hook - Handle transaction form state
 */
export function useTransactionForm() {
  const [formData, setFormData] = useState({
    to: '',
    amount: '',
    chainType: 'ethereum' as ChainType,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;

      setFormData(prev => ({ ...prev, [name]: value }));

      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    },
    [errors]
  );

  const handleBlur = useCallback((field: string) => {
    setTouched(prev => new Set([...prev, field]));
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    const addressValidation = NetworkValidationService.validateAddress(
      formData.to,
      formData.chainType
    );

    if (!formData.to) {
      newErrors.to = 'Address is required';
    } else if (!addressValidation.isValid) {
      newErrors.to = addressValidation.error || 'Invalid address';
    }

    const amountValidation = NetworkValidationService.validateAmount(
      formData.amount,
      formData.chainType
    );

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (!amountValidation.isValid) {
      newErrors.amount = amountValidation.error || 'Invalid amount';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const reset = useCallback(() => {
    setFormData({ to: '', amount: '', chainType: 'ethereum' });
    setErrors({});
    setTouched(new Set());
  }, []);

  return {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    reset,
  };
}

/**
 * useMultiChainState Hook - Manage multi-chain app state
 */
export function useMultiChainState() {
  const [state, setState] = useLocalStorage('renvault_state', {
    selectedChain: 'ethereum' as ChainType,
    userAddress: null as string | null,
    isConnected: false,
  });

  const updateChain = useCallback((chain: ChainType) => {
    setState(prev => ({ ...prev, selectedChain: chain }));
  }, [setState]);

  const updateAddress = useCallback((address: string | null) => {
    setState(prev => ({
      ...prev,
      userAddress: address,
      isConnected: !!address,
    }));
  }, [setState]);

  return { state, updateChain, updateAddress };
}

/**
 * useErrorHandler Hook - Handle errors with recovery
 */
export function useErrorHandler() {
  const [errors, setErrors] = useState<any[]>([]);

  const handleError = useCallback((error: any) => {
    setErrors(prev => [error, ...prev].slice(0, 10));
  }, []);

  const clearError = useCallback((index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setErrors([]);
  }, []);

  useEffect(() => {
    const unsubscribe = MultiChainErrorHandler.onError(error => {
      handleError(error);
    });

    return unsubscribe;
  }, [handleError]);

  return { errors, clearError, clearAll, handleError };
}

export default {
  useAsync,
  useLocalStorage,
  usePrevious,
  useDebounce,
  useChainInfo,
  useAddressValidation,
  useAmountValidation,
  useTransactionTracking,
  useChainHealth,
  useTransactionForm,
  useMultiChainState,
  useErrorHandler,
};
