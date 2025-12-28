/**
 * WalletKit Sign API v2 wrapper
 * Exposes batch signing, typed data, message signing, hardware signing, verification and multi-sig coordination
 */

import { AppKitService } from './walletkit-service';
import { batchSigningService } from './signing/batch-signing';
import { eip712SigningService } from './signing/eip712-signing';
import { messageSigningService } from './signing/message-signing';
import { hardwareWalletSigningService } from './signing/hardware-wallet-signing';
import { signatureVerificationService } from './signing/signature-verification';
import { multiSigCoordinationService } from './signing/multi-sig-coordination';
import {
  BatchSigningRequest,
  BatchSigningResponse,
  TypedDataSigningRequest,
  TypedDataSigningResponse,
  MessageSigningRequest,
  MessageSigningResponse,
  HardwareSigningRequest,
  HardwareSigningResponse,
  MultiSigSigningRequest,
  MultiSigSigningResponse,
  SignatureVerificationRequest,
  SignatureVerificationResponse,
} from '../types/signing';
import { logger } from '../utils/logger';
import { WalletError, WalletErrorCode } from '../utils/wallet-errors';

class WalletKitSigningService {
  private static instance: WalletKitSigningService;

  static getInstance(): WalletKitSigningService {
    if (!WalletKitSigningService.instance) {
      WalletKitSigningService.instance = new WalletKitSigningService();
    }
    return WalletKitSigningService.instance;
  }

  private constructor() {}

  private getAppKit(): any | null {
    try {
      const appKitService = AppKitService.getInstance();
      return appKitService.getAppKit();
    } catch (e) {
      return null;
    }
  }

  async signTransactions(request: BatchSigningRequest): Promise<BatchSigningResponse> {
    const appKit = this.getAppKit();

    try {
      if (appKit && typeof appKit.signTransactions === 'function') {
        return await appKit.signTransactions(request);
      }

      // Fallback to local batch signing service
      return await batchSigningService.signBatch(request);
    } catch (error) {
      logger.error('signTransactions failed', error);
      throw new WalletError(WalletErrorCode.SIGNING_FAILED, 'Batch signing failed', error);
    }
  }

  async signTypedData(request: TypedDataSigningRequest): Promise<TypedDataSigningResponse> {
    const appKit = this.getAppKit();

    try {
      if (appKit && typeof appKit.signTypedData === 'function') {
        return await appKit.signTypedData(request);
      }

      return await eip712SigningService.signTypedData(request);
    } catch (error) {
      logger.error('signTypedData failed', error);
      throw new WalletError(WalletErrorCode.SIGNING_FAILED, 'Typed data signing failed', error);
    }
  }

  async signMessage(request: MessageSigningRequest): Promise<MessageSigningResponse> {
    const appKit = this.getAppKit();

    try {
      if (appKit && typeof appKit.signMessage === 'function') {
        return await appKit.signMessage(request);
      }

      return await messageSigningService.signMessage(request);
    } catch (error) {
      logger.error('signMessage failed', error);
      throw new WalletError(WalletErrorCode.SIGNING_FAILED, 'Message signing failed', error);
    }
  }

  async signWithHardware(request: HardwareSigningRequest): Promise<HardwareSigningResponse> {
    const appKit = this.getAppKit();

    try {
      if (appKit && typeof appKit.signWithHardware === 'function') {
        return await appKit.signWithHardware(request);
      }

      return await hardwareWalletSigningService.signWithHardware(request);
    } catch (error) {
      logger.error('signWithHardware failed', error);
      throw new WalletError(WalletErrorCode.SIGNING_FAILED, 'Hardware signing failed', error);
    }
  }

  async verifySignature(request: SignatureVerificationRequest): Promise<SignatureVerificationResponse> {
    try {
      return await signatureVerificationService.verifySignature(request);
    } catch (error) {
      logger.error('verifySignature failed', error);
      throw new WalletError(WalletErrorCode.UNKNOWN_ERROR, 'Signature verification failed', error);
    }
  }

  async initiateMultiSig(request: MultiSigSigningRequest): Promise<MultiSigSigningResponse> {
    try {
      return await multiSigCoordinationService.initiateMultiSigSigning(request);
    } catch (error) {
      logger.error('initiateMultiSig failed', error);
      throw new WalletError(WalletErrorCode.UNKNOWN_ERROR, 'Multi-sig initiation failed', error);
    }
  }

  async addMultiSigSignature(transactionId: string, signer: string, signature: any): Promise<MultiSigSigningResponse> {
    try {
      return await multiSigCoordinationService.addSignature(transactionId, signer, signature);
    } catch (error) {
      logger.error('addMultiSigSignature failed', error);
      throw new WalletError(WalletErrorCode.UNKNOWN_ERROR, 'Adding multi-sig signature failed', error);
    }
  }
}

export const walletKitSigningService = WalletKitSigningService.getInstance();
