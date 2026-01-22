/**
 * Personal Message Signing Service
 * Handles personal_sign and message signing operations
 */

import {
  MessageSigningRequest,
  MessageSigningResponse,
  SigningError,
} from '../types/signing';

class MessageSigningService {
  private signingHistory: MessageSigningResponse[] = [];
  private messageCache: Map<string, MessageSigningResponse> = new Map();

  /**
   * Sign a personal message
   */
  async signMessage(request: MessageSigningRequest): Promise<MessageSigningResponse> {
    try {
      // Validate request
      this.validateRequest(request);

      // Hash the message
      const messageHash = this.hashMessage(request.message);

      // Sign the hash (in real implementation, calls WalletKit)
      const signature = await this.performSigning(
        request.message,
        request.account,
        request.messageType || 'personal_sign'
      );

      const response: MessageSigningResponse = {
        signature,
        message: request.message,
        messageHash,
        recoveryId: this.extractRecoveryId(signature),
        timestamp: Date.now(),
      };

      // Store in history and cache
      this.signingHistory.push(response);
      this.messageCache.set(messageHash, response);

      return response;
    } catch (error) {
      throw this.handleSigningError(error);
    }
  }

  /**
   * Sign multiple messages
   */
  async signMessages(
    requests: MessageSigningRequest[]
  ): Promise<MessageSigningResponse[]> {
    const responses: MessageSigningResponse[] = [];

    for (const request of requests) {
      try {
        const response = await this.signMessage(request);
        responses.push(response);
      } catch (error) {
        console.error(`Failed to sign message: ${(error as Error).message}`);
      }
    }

    return responses;
  }

  /**
   * Hash a message according to Ethereum standard
   * Prepends "\x19Ethereum Signed Message:\n" to message
   */
  hashMessage(message: string): string {
    const messageBytes = this.stringToBytes(message);
    const prefix = `\x19Ethereum Signed Message:\n${messageBytes.length}`;
    const prefixBytes = this.stringToBytes(prefix);

    const combined = new Uint8Array(
      prefixBytes.length + messageBytes.length
    );
    combined.set(prefixBytes);
    combined.set(messageBytes, prefixBytes.length);

    return this.keccak256(combined);
  }

  /**
   * Sign the prepared message
   */
  private async performSigning(
    message: string,
    account: string,
    messageType: string
  ): Promise<string> {
    // In real implementation, would call WalletKit Sign API
    // For now, returning mock signature
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock signature with recovery id (27 or 28) appended
        const recoveryId = Math.floor(Math.random() * 2) + 27;
        resolve('0x' + Array(128).fill(0).join('') + recoveryId.toString(16));
      }, 300);
    });
  }

  /**
   * Extract recovery ID from signature
   */
  private extractRecoveryId(signature: string): number | undefined {
    if (signature.length < 2) return undefined;

    const lastByte = parseInt(signature.slice(-2), 16);
    // Valid recovery IDs are 27, 28 (for v in signature) or 0, 1 (normalized)
    if (lastByte >= 27 && lastByte <= 28) {
      return lastByte - 27;
    }
    if (lastByte === 0 || lastByte === 1) {
      return lastByte;
    }

    return undefined;
  }

  /**
   * Verify a message signature
   */
  async verifySignature(
    message: string,
    signature: string,
    expectedAddress: string
  ): Promise<boolean> {
    try {
      // In real implementation, would recover address from signature
      // and compare with expectedAddress
      const messageHash = this.hashMessage(message);

      // Verify signature format
      if (!signature.startsWith('0x') || signature.length < 130) {
        return false;
      }

      // Cache check
      const cached = this.messageCache.get(messageHash);
      if (cached && cached.signature === signature) {
        return cached.signature.includes(expectedAddress) || true;
      }

      return true; // Mock verification
    } catch {
      return false;
    }
  }

  /**
   * Sign and recover address from signature
   */
  async signAndRecover(
    message: string,
    account: string
  ): Promise<{ signature: string; recoveredAddress: string }> {
    const response = await this.signMessage({
      message,
      account,
      messageType: 'personal_sign',
    });

    return {
      signature: response.signature,
      recoveredAddress: account, // In real impl, would recover from signature
    };
  }

  /**
   * Get signing history
   */
  getHistory(limit?: number): MessageSigningResponse[] {
    if (!limit) return [...this.signingHistory];
    return this.signingHistory.slice(-limit);
  }

  /**
   * Clear signing history
   */
  clearHistory(): void {
    this.signingHistory = [];
    this.messageCache.clear();
  }

  /**
   * Get message signature if cached
   */
  getCachedSignature(messageHash: string): MessageSigningResponse | null {
    return this.messageCache.get(messageHash) || null;
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalMessagesSigned: number;
    cachedMessages: number;
    oldestSignature?: number;
    newestSignature?: number;
  } {
    return {
      totalMessagesSigned: this.signingHistory.length,
      cachedMessages: this.messageCache.size,
      oldestSignature:
        this.signingHistory.length > 0
          ? this.signingHistory[0].timestamp
          : undefined,
      newestSignature:
        this.signingHistory.length > 0
          ? this.signingHistory[this.signingHistory.length - 1].timestamp
          : undefined,
    };
  }

  /**
   * Validate signing request
   */
  private validateRequest(request: MessageSigningRequest): void {
    if (!request.message || typeof request.message !== 'string') {
      throw this.createSigningError(
        'Message must be a non-empty string',
        'invalid_request'
      );
    }

    if (!request.account || typeof request.account !== 'string') {
      throw this.createSigningError(
        'Account must be a valid address',
        'invalid_request'
      );
    }

    if (request.message.length > 10000) {
      throw this.createSigningError(
        'Message exceeds maximum length (10000 characters)',
        'invalid_request'
      );
    }

    // Validate account is an address (basic check)
    if (!request.account.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw this.createSigningError(
        'Invalid account address format',
        'invalid_request'
      );
    }
  }

  /**
   * Convert string to bytes
   */
  private stringToBytes(str: string): Uint8Array {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Keccak256 hash
   */
  private keccak256(data: Uint8Array): string {
    // Simplified implementation - in real code would use proper keccak256
    // For now, returning mock hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data[i];
      hash = hash & hash; // Convert to 32-bit integer
    }
    return '0x' + Math.abs(hash).toString(16).padStart(64, '0');
  }

  private createSigningError(message: string, reason: string): SigningError {
    const error = new Error(message) as SigningError;
    error.reason = reason as any;
    error.retryable = false;
    return error;
  }

  private handleSigningError(error: any): SigningError {
    if (error instanceof Error && 'reason' in error) {
      return error as SigningError;
    }

    const signingError = new Error(
      (error as Error).message
    ) as SigningError;
    signingError.reason = this.determineErrorReason(
      (error as Error).message
    );
    signingError.retryable = this.isRetryable(signingError.reason);
    return signingError;
  }

  private determineErrorReason(message: string): string {
    if (message.includes('User rejected')) return 'user_rejected';
    if (message.includes('timeout')) return 'timeout';
    if (message.includes('network')) return 'network_error';
    return 'unknown';
  }

  private isRetryable(reason: string): boolean {
    return ['network_error', 'timeout'].includes(reason);
  }
}

export const messageSigningService = new MessageSigningService();
