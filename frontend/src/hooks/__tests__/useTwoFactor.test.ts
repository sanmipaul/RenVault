/**
 * useTwoFactor hook unit tests
 *
 * Uses renderHook from @testing-library/react to exercise the hook in
 * isolation.  localStorage is mocked to avoid real browser storage.
 */

import { renderHook, act } from '@testing-library/react';
import { useTwoFactor } from '../useTwoFactor';
import { STORAGE_KEYS } from '../../services/security/TwoFactorSecureStorage';

const store: Record<string, string> = {};
const localStorageMock: Storage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  key: (index: number) => Object.keys(store)[index] ?? null,
  get length() { return Object.keys(store).length; },
};

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

const WALLET = 'SP1HOOK0000000000000000000000000000000';

beforeEach(() => {
  localStorageMock.clear();
});

describe('useTwoFactor', () => {
  it('initialises tfaEnabled as false when no data is stored', () => {
    const { result } = renderHook(() => useTwoFactor());
    expect(result.current.tfaEnabled).toBe(false);
  });

  it('initialises tfaEnabled as true when encrypted secret exists', async () => {
    // Pre-populate via the storage directly so the hook reads it on init
    localStorage.setItem('tfa-enabled', 'true');
    const { result } = renderHook(() => useTwoFactor());
    expect(result.current.tfaEnabled).toBe(true);
  });

  it('enable() saves secret, codes, and sets tfaEnabled to true', async () => {
    const { result } = renderHook(() => useTwoFactor());
    await act(async () => {
      await result.current.enable('SECRET', ['A', 'B'], WALLET);
    });
    expect(result.current.tfaEnabled).toBe(true);
    expect(localStorage.getItem('tfa-enabled')).toBe('true');
    expect(localStorage.getItem(STORAGE_KEYS.encryptedSecret)).not.toBeNull();
  });

  it('disable() clears all 2FA data and sets tfaEnabled to false', async () => {
    const { result } = renderHook(() => useTwoFactor());
    await act(async () => {
      await result.current.enable('SECRET', ['A'], WALLET);
    });
    act(() => {
      result.current.disable();
    });
    expect(result.current.tfaEnabled).toBe(false);
    expect(localStorage.getItem('tfa-enabled')).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.encryptedSecret)).toBeNull();
  });

  it('verifyBackupCode() returns true for valid code and false for invalid', async () => {
    const { result } = renderHook(() => useTwoFactor());
    await act(async () => {
      await result.current.enable('S', ['CODE-1', 'CODE-2'], WALLET);
    });
    let valid: boolean = false;
    await act(async () => {
      valid = await result.current.verifyBackupCode('CODE-1', WALLET);
    });
    expect(valid).toBe(true);

    let invalid: boolean = false;
    await act(async () => {
      invalid = await result.current.verifyBackupCode('CODE-1', WALLET); // already consumed
    });
    expect(invalid).toBe(false);
  });

  it('clear() removes all 2FA data and sets tfaEnabled to false', async () => {
    const { result } = renderHook(() => useTwoFactor());
    await act(async () => {
      await result.current.enable('S', ['X'], WALLET);
    });
    act(() => {
      result.current.clear();
    });
    expect(result.current.tfaEnabled).toBe(false);
  });
});
