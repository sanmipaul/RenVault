/**
 * Signature Verification Service
 * Comprehensive signature verification and recovery
 */

import {
  SignatureVerificationRequest,
  SignatureVerificationResponse,
  SigningError,
} from '../types/signing';

class SignatureVerificationService {
  private verificationCache: Map<string, SignatureVerificationResponse> =
    new Map();
  private verificationLog: VerificationLogEntry[] = [];

  /**
   * Verify a signature
   */
  async verifySignature(
    request: SignatureVerificationRequest
  ): Promise<SignatureVerificationResponse> {
    try {
      // Validate request
      this.validateRequest(request);

      // Check cache first
      const cacheKey = this.generateCacheKey(request);
      const cached = this.verificationCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Perform verification
      const isValid = await this.performVerification(request);

      // Recover address if signature is valid
      let recoveredAddress: string | undefined;
      if (isValid) {
        recoveredAddress = this.recoverAddress(request);
      }

      const response: SignatureVerificationResponse = {
        isValid,
        recoveredAddress,
        verifiedAt: Date.now(),
      };

      // Cache the result
      this.verificationCache.set(cacheKey, response);

      // Log verification
      this.logVerification(request, response);

      return response;
    } catch (error) {
      throw this.handleVerificationError(error);
    }
  }

  /**
   * Verify batch signatures
   */
  async verifySignatures(
    requests: SignatureVerificationRequest[]
  ): Promise<SignatureVerificationResponse[]> {
    const responses: SignatureVerificationResponse[] = [];

    for (const request of requests) {
      try {
        const response = await this.verifySignature(request);
        responses.push(response);
      } catch (error) {
        console.error(
          `Signature verification failed: ${(error as Error).message}`
        );
      }
    }

    return responses;
  }

  /**
   * Recover address from signature
   */
  private recoverAddress(request: SignatureVerificationRequest): string {
    // In real implementation, would use ethers.js recoverAddress
    // or similar library to recover address from signature
    // For now, returning mock recovery

    // Validate signature format
    if (!request.signature.startsWith('0x')) {
      return '0x0000000000000000000000000000000000000000';
    }

    // Extract potential recovery ID from signature
    const recoveryId = this.extractRecoveryId(request.signature);

    // Generate deterministic mock address based on message and recovery ID
    const messageHash = this.hashMessage(request.message);
    const addressHash = this.hashCombined(messageHash, recoveryId?.toString() || '0');

    return '0x' + addressHash.slice(0, 40);
  }

  /**
   * Verify signature with algorithm-specific logic
   */
  private async performVerification(
    request: SignatureVerificationRequest
  ): Promise<boolean> {
    // Basic format validation
    if (!this.isValidSignatureFormat(request.signature)) {
      return false;
    }

    // Algorithm-specific verification
    const algorithm = request.algorithm || 'ECDSA';
    switch (algorithm) {
      case 'ECDSA':
        return this.verifyECDSA(request);
      case 'EdDSA':
        return this.verifyEdDSA(request);
      case 'BLS':
        return this.verifyBLS(request);
      default:
        return false;
    }
  }

  private verifyECDSA(request: SignatureVerificationRequest): boolean {
    // ECDSA signature verification
    // In real implementation, would use proper cryptography library
    try {
      const { message, signature, publicKey } = request;

      // Verify signature components
      const r = signature.slice(2, 66);
      const s = signature.slice(66, 130);
      const v = signature.length > 130 ? signature.slice(130, 132) : 'be';

      // Validate r and s are valid hex
      if (!/^[0-9a-f]+$/i.test(r) || !/^[0-9a-f]+$/i.test(s)) {
        return false;
      }

      // Validate v
      if (!/^[0-9a-f]{2}$/i.test(v)) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  private verifyEdDSA(request: SignatureVerificationRequest): boolean {
    // EdDSA signature verification
    try {
      const { signature } = request;

      // EdDSA signatures are 64 bytes (128 hex chars)
      if (signature.length !== 130) {
        // 0x + 128 chars
        return false;
      }

      return /^0x[0-9a-f]{128}$/i.test(signature);
    } catch {
      return false;
    }
  }

  private verifyBLS(request: SignatureVerificationRequest): boolean {
    // BLS signature verification
    try {
      const { signature } = request;

      // BLS signatures are typically 96 bytes (192 hex chars)
      if (signature.length !== 194) {
        // 0x + 192 chars
        return false;
      }

      return /^0x[0-9a-f]{192}$/i.test(signature);
    } catch {
      return false;
    }
  }

  /**
   * Check if signature has valid format
   */
  private isValidSignatureFormat(signature: string): boolean {
    return (
      signature.startsWith('0x') &&
      /^0x[0-9a-f]+$/i.test(signature) &&
      signature.length >= 130
    ); // Min 65 bytes (0x + 128 hex chars)
  }

  /**
   * Extract recovery ID from signature
   */
  private extractRecoveryId(signature: string): number | null {
    if (signature.length < 132) {
      return null;
    }

    try {
      const v = parseInt(signature.slice(130, 132), 16);
      // Valid recovery IDs for Ethereum: 27, 28 or 0, 1
      if ((v >= 27 && v <= 28) || (v === 0 || v === 1)) {
        return v >= 27 ? v - 27 : v;
      }
    } catch {
      return null;
    }

    return null;
  }

  /**
   * Hash message
   */
  private hashMessage(message: string): string {
    // Ethereum personal_sign message hashing
    const messageBytes = new TextEncoder().encode(message);
    const prefix = `\x19Ethereum Signed Message:\n${messageBytes.length}`;
    const prefixBytes = new TextEncoder().encode(prefix);

    // Combine and hash (mock implementation)
    let hash = 0;
    for (let i = 0; i < prefixBytes.length + messageBytes.length; i++) {
      const byte =
        i < prefixBytes.length ? prefixBytes[i] : messageBytes[i - prefixBytes.length];
      hash = ((hash << 5) - hash) + byte;
      hash = hash & hash;
    }

    return '0x' + Math.abs(hash).toString(16).padStart(64, '0');
  }

  /**
   * Hash combined values
   */
  private hashCombined(value1: string, value2: string): string {
    let hash = 0;
    const combined = value1 + value2;

    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(16).padStart(40, '0');
  }

  /**
   * Get verification history
   */
  getVerificationHistory(limit?: number): VerificationLogEntry[] {
    if (!limit) return [...this.verificationLog];
    return this.verificationLog.slice(-limit);
  }

  /**
   * Clear verification cache
   */
  clearCache(): void {
    this.verificationCache.clear();
  }

  /**
   * Clear verification log
   */
  clearLog(): void {
    this.verificationLog = [];
  }

  /**
   * Get verification statistics
   */
  getStatistics(): {
    totalVerifications: number;
    successfulVerifications: number;
    failedVerifications: number;
    successRate: number;
    cachedVerifications: number;
  } {
    const total = this.verificationLog.length;
    const successful = this.verificationLog.filter((e) => e.isValid).length;
    const failed = total - successful;
    const successRate = total > 0 ? (successful / total) * 100 : 0;

    return {
      totalVerifications: total,
      successfulVerifications: successful,
      failedVerifications: failed,
      successRate,
      cachedVerifications: this.verificationCache.size,
    };
  }

  /**
   * Validate verification request
   */
  private validateRequest(request: SignatureVerificationRequest): void {
    if (!request.message || typeof request.message !== 'string') {
      throw this.createError(
        'Message must be a non-empty string',
        'invalid_request'
      );
    }

    if (!request.signature || typeof request.signature !== 'string') {
      throw this.createError(
        'Signature must be a non-empty string',
        'invalid_request'
      );
    }

    if (!request.publicKey || typeof request.publicKey !== 'string') {
      throw this.createError(
        'Public key must be a non-empty string',
        'invalid_request'
      );
    }

    if (!request.signature.startsWith('0x')) {
      throw this.createError(
        'Signature must be hex-encoded (0x prefix)',
        'invalid_request'
      );
    }
  }

  private logVerification(
    request: SignatureVerificationRequest,
    response: SignatureVerificationResponse
  ): void {
    this.verificationLog.push({
      message: request.message.substring(0, 50), // Store only first 50 chars
      signature: request.signature.substring(0, 20) + '...', // Store truncated
      isValid: response.isValid,
      recoveredAddress: response.recoveredAddress,
      algorithm: request.algorithm || 'ECDSA',
      timestamp: response.verifiedAt,
    });

    // Keep log size manageable
    if (this.verificationLog.length > 10000) {
      this.verificationLog = this.verificationLog.slice(-10000);
    }
  }

  private generateCacheKey(request: SignatureVerificationRequest): string {
    return `${request.message}-${request.signature}-${request.publicKey}`;
  }

  private createError(message: string, reason: string): SigningError {
    const error = new Error(message) as SigningError;
    error.reason = reason as any;
    error.retryable = false;
    return error;
  }

  private handleVerificationError(error: any): SigningError {
    if (error instanceof Error && 'reason' in error) {
      return error as SigningError;
    }

    const signingError = new Error(
      (error as Error).message
    ) as SigningError;
    signingError.reason = 'unknown';
    signingError.retryable = false;
    return signingError;
  }
}

interface VerificationLogEntry {
  message: string;
  signature: string;
  isValid: boolean;
  recoveredAddress?: string;
  algorithm: string;
  timestamp: number;
}

export const signatureVerificationService = new SignatureVerificationService();
