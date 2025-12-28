/**
 * Multi-Signature Coordination Service
 * Manages multi-signature transaction signing workflows
 */

import {
  MultiSigSigningRequest,
  MultiSigSigningResponse,
  SigningResponse,
  SigningError,
} from '../types/signing';

class MultiSigCoordinationService {
  private multiSigSessions: Map<string, MultiSigSession> = new Map();
  private completedSignings: Map<string, MultiSigSigningResponse> = new Map();

  /**
   * Initiate multi-signature signing
   */
  async initiateMultiSigSigning(
    request: MultiSigSigningRequest
  ): Promise<MultiSigSigningResponse> {
    try {
      // Validate request
      this.validateMultiSigRequest(request);

      const transactionId = request.transaction.id || this.generateTransactionId();
      const expiresAt = Date.now() + (request.timeoutMs || 3600000); // 1 hour default

      // Create signing session
      const session: MultiSigSession = {
        transactionId,
        requiredSignatures: request.requiredSignatures,
        totalSigners: request.signers.length,
        signatures: new Map(),
        signers: request.signers,
        createdAt: Date.now(),
        expiresAt,
        status: 'pending',
        metadata: request.metadata,
      };

      this.multiSigSessions.set(transactionId, session);

      return this.compileResponse(transactionId, session);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add signature from a signer
   */
  async addSignature(
    transactionId: string,
    signer: string,
    signature: SigningResponse
  ): Promise<MultiSigSigningResponse> {
    try {
      const session = this.multiSigSessions.get(transactionId);
      if (!session) {
        throw this.createError(
          `Transaction ${transactionId} not found`,
          'invalid_request'
        );
      }

      // Check if session expired
      if (Date.now() > session.expiresAt) {
        session.status = 'expired';
        throw this.createError(
          'Multi-signature session has expired',
          'timeout'
        );
      }

      // Verify signer is authorized
      if (!session.signers.includes(signer)) {
        throw this.createError(
          `Signer ${signer} is not authorized for this transaction`,
          'invalid_request'
        );
      }

      // Check if signer already signed
      if (session.signatures.has(signer)) {
        throw this.createError(
          `Signer ${signer} has already signed this transaction`,
          'invalid_request'
        );
      }

      // Add signature
      session.signatures.set(signer, signature);

      // Check if threshold is reached
      if (session.signatures.size >= session.requiredSignatures) {
        session.status = 'completed';
      }

      return this.compileResponse(transactionId, session);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Batch add signatures
   */
  async addSignatures(
    transactionId: string,
    signerSignatures: Map<string, SigningResponse>
  ): Promise<MultiSigSigningResponse> {
    const session = this.multiSigSessions.get(transactionId);
    if (!session) {
      throw this.createError(
        `Transaction ${transactionId} not found`,
        'invalid_request'
      );
    }

    for (const [signer, signature] of signerSignatures.entries()) {
      try {
        await this.addSignature(transactionId, signer, signature);
      } catch (error) {
        console.warn(`Failed to add signature from ${signer}:`, error);
      }
    }

    return this.compileResponse(transactionId, session);
  }

  /**
   * Get multi-sig status
   */
  getMultiSigStatus(
    transactionId: string
  ): MultiSigSigningResponse | null {
    const session = this.multiSigSessions.get(transactionId);
    if (!session) return null;

    return this.compileResponse(transactionId, session);
  }

  /**
   * Check if multi-sig is complete
   */
  isComplete(transactionId: string): boolean {
    const session = this.multiSigSessions.get(transactionId);
    if (!session) return false;

    return session.signatures.size >= session.requiredSignatures;
  }

  /**
   * Get remaining signers
   */
  getRemainingSigners(transactionId: string): string[] {
    const session = this.multiSigSessions.get(transactionId);
    if (!session) return [];

    return session.signers.filter((signer) => !session.signatures.has(signer));
  }

  /**
   * Cancel multi-sig transaction
   */
  cancelMultiSig(transactionId: string): void {
    const session = this.multiSigSessions.get(transactionId);
    if (session) {
      session.status = 'cancelled';
    }
  }

  /**
   * Complete multi-sig transaction
   */
  completeMultiSig(transactionId: string): MultiSigSigningResponse | null {
    const session = this.multiSigSessions.get(transactionId);
    if (!session) return null;

    if (session.signatures.size < session.requiredSignatures) {
      throw this.createError(
        'Insufficient signatures to complete transaction',
        'invalid_request'
      );
    }

    session.status = 'completed';
    const response = this.compileResponse(transactionId, session);

    // Cache the result
    this.completedSignings.set(transactionId, response);

    // Clean up session
    this.multiSigSessions.delete(transactionId);

    return response;
  }

  /**
   * Get all active multi-sig sessions
   */
  getActiveSessions(): MultiSigSigningResponse[] {
    const responses: MultiSigSigningResponse[] = [];

    for (const [transactionId, session] of this.multiSigSessions.entries()) {
      if (session.status !== 'completed' && session.status !== 'cancelled' && session.status !== 'expired') {
        responses.push(this.compileResponse(transactionId, session));
      }
    }

    return responses;
  }

  /**
   * Get session details
   */
  getSessionDetails(transactionId: string): MultiSigSession | null {
    return this.multiSigSessions.get(transactionId) || null;
  }

  /**
   * Clear expired sessions
   */
  clearExpiredSessions(): number {
    let cleared = 0;
    const now = Date.now();

    for (const [transactionId, session] of this.multiSigSessions.entries()) {
      if (now > session.expiresAt) {
        session.status = 'expired';
        this.multiSigSessions.delete(transactionId);
        cleared++;
      }
    }

    return cleared;
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    activeSessions: number;
    completedTransactions: number;
    averageSignersPerTransaction: number;
    averageSignatureTime: number;
  } {
    const activeSessions = this.multiSigSessions.size;
    const completedTransactions = this.completedSignings.size;

    let totalSigners = 0;
    let totalTime = 0;

    for (const session of this.multiSigSessions.values()) {
      totalSigners += session.totalSigners;
    }

    for (const response of this.completedSignings.values()) {
      totalTime += response.signatures.length; // Simplified metric
    }

    return {
      activeSessions,
      completedTransactions,
      averageSignersPerTransaction:
        activeSessions > 0 ? totalSigners / activeSessions : 0,
      averageSignatureTime:
        completedTransactions > 0 ? totalTime / completedTransactions : 0,
    };
  }

  // Private methods

  private validateMultiSigRequest(request: MultiSigSigningRequest): void {
    if (!request.transaction || !request.transaction.id) {
      throw this.createError(
        'Transaction with id is required',
        'invalid_request'
      );
    }

    if (
      !request.requiredSignatures ||
      request.requiredSignatures < 1
    ) {
      throw this.createError(
        'Required signatures must be at least 1',
        'invalid_request'
      );
    }

    if (!request.signers || request.signers.length === 0) {
      throw this.createError(
        'At least one signer is required',
        'invalid_request'
      );
    }

    if (request.requiredSignatures > request.signers.length) {
      throw this.createError(
        'Required signatures cannot exceed number of signers',
        'invalid_request'
      );
    }

    if (!request.chainId) {
      throw this.createError(
        'Chain ID is required',
        'invalid_request'
      );
    }
  }

  private compileResponse(
    transactionId: string,
    session: MultiSigSession
  ): MultiSigSigningResponse {
    const remainingSigners = session.signers.filter(
      (s) => !session.signatures.has(s)
    );

    return {
      transactionId,
      signatures: new Map(session.signatures),
      isComplete: session.signatures.size >= session.requiredSignatures,
      requiredSignatures: session.requiredSignatures,
      currentSignatures: session.signatures.size,
      remainingSigners,
      expiresAt: session.expiresAt,
    };
  }

  private generateTransactionId(): string {
    return `multisig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private createError(message: string, reason: string): SigningError {
    const error = new Error(message) as SigningError;
    error.reason = reason as any;
    error.retryable = false;
    return error;
  }

  private handleError(error: any): SigningError {
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

interface MultiSigSession {
  transactionId: string;
  requiredSignatures: number;
  totalSigners: number;
  signatures: Map<string, SigningResponse>;
  signers: string[];
  createdAt: number;
  expiresAt: number;
  status: 'pending' | 'completed' | 'cancelled' | 'expired';
  metadata?: Record<string, any>;
}

export const multiSigCoordinationService = new MultiSigCoordinationService();
