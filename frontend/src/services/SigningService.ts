import {
  openSignMessage,
  openSTXTransfer,
  openContractCall,
  openContractDeploy,
} from '@stacks/connect';
import { WalletError, WalletErrorCode } from '../utils/wallet-errors';
import { logger } from '../utils/logger';

/** All WalletConnect methods this wallet supports */
export enum SigningMethodType {
  STACKS_SIGN_MESSAGE = 'stacks_signMessage',
  STACKS_STX_TRANSFER = 'stacks_stxTransfer',
  STACKS_CONTRACT_CALL = 'stacks_contractCall',
  STACKS_CONTRACT_DEPLOY = 'stacks_contractDeploy',
}

/** Timeout (ms) before a pending signing request is auto-rejected */
export const SIGNING_TIMEOUT_MS = 120_000; // 2 minutes

/** Maximum length of a Stacks address (C32-encoded) */
export const MAX_STACKS_ADDRESS_LENGTH = 42;

// ---------------------------------------------------------------------------
// Parameter shapes
// ---------------------------------------------------------------------------

export interface SignMessageParams {
  message: string;
  network?: string;
}

export interface StxTransferParams {
  recipient: string;
  amount: string;
  memo?: string;
  network?: string;
}

export interface ContractCallParams {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: unknown[];
  network?: string;
  postConditions?: unknown[];
}

export interface ContractDeployParams {
  contractName: string;
  codeBody: string;
  network?: string;
}

export type SigningParams =
  | SignMessageParams
  | StxTransferParams
  | ContractCallParams
  | ContractDeployParams;

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------

function validateSignMessageParams(params: unknown): SignMessageParams {
  const p = params as Record<string, unknown>;
  if (!p || typeof p.message !== 'string' || p.message.trim().length === 0) {
    throw new WalletError(
      WalletErrorCode.INVALID_REQUEST,
      'stacks_signMessage requires a non-empty "message" string'
    );
  }
  return { message: p.message, network: p.network as string | undefined };
}

function validateStxTransferParams(params: unknown): StxTransferParams {
  const p = params as Record<string, unknown>;
  if (!p || typeof p.recipient !== 'string' || p.recipient.trim().length === 0) {
    throw new WalletError(WalletErrorCode.INVALID_REQUEST, 'stacks_stxTransfer requires "recipient"');
  }
  if (p.recipient.length > MAX_STACKS_ADDRESS_LENGTH) {
    throw new WalletError(
      WalletErrorCode.INVALID_REQUEST,
      `stacks_stxTransfer "recipient" exceeds max length of ${MAX_STACKS_ADDRESS_LENGTH}`
    );
  }
  if (typeof p.amount !== 'string' && typeof p.amount !== 'number') {
    throw new WalletError(WalletErrorCode.INVALID_REQUEST, 'stacks_stxTransfer requires "amount"');
  }
  return {
    recipient: p.recipient,
    amount: String(p.amount),
    memo: p.memo as string | undefined,
    network: p.network as string | undefined,
  };
}

function validateContractCallParams(params: unknown): ContractCallParams {
  const p = params as Record<string, unknown>;
  if (!p || typeof p.contractAddress !== 'string') {
    throw new WalletError(WalletErrorCode.INVALID_REQUEST, 'stacks_contractCall requires "contractAddress"');
  }
  if (p.contractAddress.length > MAX_STACKS_ADDRESS_LENGTH) {
    throw new WalletError(
      WalletErrorCode.INVALID_REQUEST,
      `stacks_contractCall "contractAddress" exceeds max length of ${MAX_STACKS_ADDRESS_LENGTH}`
    );
  }
  if (typeof p.contractName !== 'string') {
    throw new WalletError(WalletErrorCode.INVALID_REQUEST, 'stacks_contractCall requires "contractName"');
  }
  if (typeof p.functionName !== 'string') {
    throw new WalletError(WalletErrorCode.INVALID_REQUEST, 'stacks_contractCall requires "functionName"');
  }
  if (!Array.isArray(p.functionArgs)) {
    throw new WalletError(WalletErrorCode.INVALID_REQUEST, 'stacks_contractCall requires "functionArgs" array');
  }
  return {
    contractAddress: p.contractAddress,
    contractName: p.contractName,
    functionName: p.functionName,
    functionArgs: p.functionArgs,
    network: p.network as string | undefined,
    postConditions: p.postConditions as unknown[] | undefined,
  };
}

function validateContractDeployParams(params: unknown): ContractDeployParams {
  const p = params as Record<string, unknown>;
  if (!p || typeof p.contractName !== 'string' || p.contractName.trim().length === 0) {
    throw new WalletError(WalletErrorCode.INVALID_REQUEST, 'stacks_contractDeploy requires "contractName"');
  }
  if (typeof p.codeBody !== 'string' || p.codeBody.trim().length === 0) {
    throw new WalletError(WalletErrorCode.INVALID_REQUEST, 'stacks_contractDeploy requires "codeBody"');
  }
  return {
    contractName: p.contractName,
    codeBody: p.codeBody,
    network: p.network as string | undefined,
  };
}

// ---------------------------------------------------------------------------
// Per-method signing helpers (wrap connect callbacks in a Promise)
// ---------------------------------------------------------------------------

function signMessage(params: SignMessageParams): Promise<string> {
  return new Promise((resolve, reject) => {
    openSignMessage({
      message: params.message,
      onFinish: (data) => resolve(data.signature),
      onCancel: () =>
        reject(new WalletError(WalletErrorCode.USER_REJECTED, 'User cancelled message signing')),
    });
  });
}

function signStxTransfer(params: StxTransferParams): Promise<string> {
  return new Promise((resolve, reject) => {
    openSTXTransfer({
      recipient: params.recipient,
      amount: params.amount,
      memo: params.memo,
      onFinish: (data) => resolve(data.txId),
      onCancel: () =>
        reject(new WalletError(WalletErrorCode.USER_REJECTED, 'User cancelled STX transfer signing')),
    });
  });
}

function signContractCall(params: ContractCallParams): Promise<string> {
  return new Promise((resolve, reject) => {
    openContractCall({
      contractAddress: params.contractAddress,
      contractName: params.contractName,
      functionName: params.functionName,
      functionArgs: params.functionArgs as any[],
      postConditions: (params.postConditions as any[]) ?? [],
      onFinish: (data) => resolve(data.txId),
      onCancel: () =>
        reject(new WalletError(WalletErrorCode.USER_REJECTED, 'User cancelled contract call signing')),
    });
  });
}

function signContractDeploy(params: ContractDeployParams): Promise<string> {
  return new Promise((resolve, reject) => {
    openContractDeploy({
      contractName: params.contractName,
      codeBody: params.codeBody,
      onFinish: (data) => resolve(data.txId),
      onCancel: () =>
        reject(new WalletError(WalletErrorCode.USER_REJECTED, 'User cancelled contract deploy signing')),
    });
  });
}

// ---------------------------------------------------------------------------
// Timeout wrapper
// ---------------------------------------------------------------------------

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () =>
        reject(
          new WalletError(
            WalletErrorCode.TRANSACTION_SIGNING_FAILED,
            `Signing request timed out after ${ms / 1000}s`
          )
        ),
      ms
    );
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); }
    );
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Route a WalletConnect session request to the appropriate Stacks signing
 * flow and return the result string (signature or txId).
 *
 * Throws WalletError for invalid params, unsupported methods, user
 * cancellation, or timeout.
 */
export async function signRequest(
  method: string,
  params: unknown,
  chainId?: string
): Promise<string> {
  logger.info(`SigningService: handling ${method} on chain ${chainId ?? 'unknown'}`);

  switch (method) {
    case SigningMethodType.STACKS_SIGN_MESSAGE: {
      const validated = validateSignMessageParams(params);
      const result = await withTimeout(signMessage(validated), SIGNING_TIMEOUT_MS);
      validateResult(result, method);
      return result;
    }

    case SigningMethodType.STACKS_STX_TRANSFER: {
      const validated = validateStxTransferParams(params);
      const result = await withTimeout(signStxTransfer(validated), SIGNING_TIMEOUT_MS);
      validateResult(result, method);
      return result;
    }

    case SigningMethodType.STACKS_CONTRACT_CALL: {
      const validated = validateContractCallParams(params);
      const result = await withTimeout(signContractCall(validated), SIGNING_TIMEOUT_MS);
      validateResult(result, method);
      return result;
    }

    case SigningMethodType.STACKS_CONTRACT_DEPLOY: {
      const validated = validateContractDeployParams(params);
      const result = await withTimeout(signContractDeploy(validated), SIGNING_TIMEOUT_MS);
      validateResult(result, method);
      return result;
    }

    default:
      throw new WalletError(
        WalletErrorCode.METHOD_NOT_SUPPORTED,
        `Unsupported signing method: ${method}`
      );
  }
}

/** Ensure the result coming back from the connect flow is a non-empty string */
function validateResult(result: unknown, method: string): void {
  if (typeof result !== 'string' || result.trim().length === 0) {
    throw new WalletError(
      WalletErrorCode.TRANSACTION_SIGNING_FAILED,
      `${method} produced an empty result`
    );
  }
}

/** Human-readable display name for a method string */
export function getMethodDisplayName(method: string): string {
  const names: Record<string, string> = {
    [SigningMethodType.STACKS_SIGN_MESSAGE]: 'Sign Message',
    [SigningMethodType.STACKS_STX_TRANSFER]: 'STX Transfer',
    [SigningMethodType.STACKS_CONTRACT_CALL]: 'Contract Call',
    [SigningMethodType.STACKS_CONTRACT_DEPLOY]: 'Contract Deploy',
  };
  return names[method] ?? method;
}

/** True if the method is one the wallet explicitly supports */
export function isSupportedMethod(method: string): boolean {
  return Object.values(SigningMethodType).includes(method as SigningMethodType);
}
