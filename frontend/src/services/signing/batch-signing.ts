/**
 * Batch Transaction Signing Service
 * Handles signing multiple transactions efficiently with WalletKit
 */

import {
  BatchSigningRequest,
  BatchSigningResponse,
  SigningResponse,
  SigningProgress,
  FailedSigningAttempt,
  SigningErrorReason,
  SigningError,
} from '../types/signing';

class BatchSigningService {
  private batchSessions: Map<string, BatchSigningRequest> = new Map();
  private batchResults: Map<string, BatchSigningResponse> = new Map();
  private activeSignings: Set<string> = new Set();

  /**
   * Sign multiple transactions in a batch
   */
  async signBatch(request: BatchSigningRequest): Promise<BatchSigningResponse> {
    const batchId = this.generateBatchId();

    try {
      // Store session
      this.batchSessions.set(batchId, request);
      this.reportProgress(batchId, 'pending', 0, 'Starting batch signing...');

      // Validate batch
      this.validateBatch(request);
      this.reportProgress(batchId, 'pending', 5, 'Batch validated successfully');

      // Simulate transactions if required
      if (request.simulationRequired) {
        await this.simulateTransactions(batchId, request);
        this.reportProgress(batchId, 'pending', 25, 'Simulation completed');
      }

      // Sign transactions
      const signatures = await this.signTransactions(batchId, request);
      this.reportProgress(batchId, 'pending', 90, 'All transactions signed');

      // Compile response
      const response = this.compileResponse(batchId, request, signatures);
      this.batchResults.set(batchId, response);
      this.reportProgress(batchId, 'completed', 100, 'Batch signing completed');

      return response;
    } catch (error) {
      this.handleBatchError(batchId, error);
      throw error;
    } finally {
      this.batchSessions.delete(batchId);
    }
  }

  private validateBatch(request: BatchSigningRequest): void {
    if (!request.transactions || request.transactions.length === 0) {
      throw this.createSigningError(
        'Invalid batch: no transactions provided',
        'invalid_request',
        null
      );
    }

    if (request.transactions.length > 100) {
      throw this.createSigningError(
        'Batch size exceeds maximum (100 transactions)',
        'invalid_request',
        null
      );
    }

    if (!request.chainId) {
      throw this.createSigningError(
        'Invalid batch: chainId is required',
        'invalid_request',
        null
      );
    }

    if (!request.topic) {
      throw this.createSigningError(
        'Invalid batch: WalletConnect topic is required',
        'invalid_request',
        null
      );
    }

    // Validate each transaction
    request.transactions.forEach((tx) => {
      if (!tx.id) {
        throw this.createSigningError(
          'Transaction missing id',
          'invalid_request',
          tx.id
        );
      }
      if (!tx.data) {
        throw this.createSigningError(
          'Transaction missing data',
          'invalid_request',
          tx.id
        );
      }
    });
  }

  private async simulateTransactions(
    batchId: string,
    request: BatchSigningRequest
  ): Promise<void> {
    const totalTxs = request.transactions.length;

    for (let i = 0; i < totalTxs; i++) {
      const tx = request.transactions[i];
      const progress = 5 + (i / totalTxs) * 20; // 5-25% for simulation

      try {
        // Simulate using eth_call or similar
        await this.simulateTransaction(tx);
        this.reportProgress(
          batchId,
          'pending',
          progress,
          `Simulating transaction ${i + 1}/${totalTxs}`
        );
      } catch (error) {
        console.warn(`Simulation failed for transaction ${tx.id}:`, error);
        // Continue with signing even if simulation fails
      }
    }
  }

  private simulateTransaction(tx: any): Promise<void> {
    return new Promise((resolve) => {
      // Simulate transaction
      setTimeout(() => resolve(), 100);
    });
  }

  private async signTransactions(
    batchId: string,
    request: BatchSigningRequest
  ): Promise<(SigningResponse | FailedSigningAttempt)[]> {
    const results: (SigningResponse | FailedSigningAttempt)[] = [];
    const totalTxs = request.transactions.length;

    for (let i = 0; i < totalTxs; i++) {
      const tx = request.transactions[i];
      const progress = 25 + (i / totalTxs) * 65; // 25-90% for signing

      this.activeSignings.add(tx.id);
      this.reportProgress(
        batchId,
        'signing',
        progress,
        `Signing transaction ${i + 1}/${totalTxs}`
      );

      try {
        const signature = await this.signTransaction(request.topic, tx);
        results.push(signature);

        this.reportProgress(
          batchId,
          'pending',
          progress + 1,
          `Transaction ${i + 1} signed`
        );
      } catch (error) {
        const failed: FailedSigningAttempt = {
          transactionId: tx.id,
          error: (error as Error).message,
          reason: this.determineErrorReason(error),
          timestamp: Date.now(),
        };
        results.push(failed);

        this.reportProgress(
          batchId,
          'pending',
          progress,
          `Transaction ${i + 1} failed`
        );
      } finally {
        this.activeSignings.delete(tx.id);
      }
    }

    return results;
  }

  private async signTransaction(topic: string, tx: any): Promise<SigningResponse> {
    // In real implementation, this would call WalletKit Sign API
    // For now, simulating the signing process
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          requestId: tx.id,
          signature: '0x' + Array(130).fill(0).join(''), // Mock signature
          signatureFormat: 'hex',
          timestamp: Date.now(),
        });
      }, 500); // Simulate signing delay
    });
  }

  private compileResponse(
    batchId: string,
    request: BatchSigningRequest,
    results: (SigningResponse | FailedSigningAttempt)[]
  ): BatchSigningResponse {
    const signatures = results.filter(
      (r): r is SigningResponse => 'signature' in r && !('error' in r)
    );
    const failed = results.filter(
      (r): r is FailedSigningAttempt => 'error' in r
    );

    return {
      batchId,
      signatures,
      failedTransactions: failed,
      totalSigned: signatures.length,
      totalFailed: failed.length,
      timestamp: Date.now(),
    };
  }

  private reportProgress(
    batchId: string,
    status: SigningProgress['status'],
    progress: number,
    message?: string
  ): void {
    const session = this.batchSessions.get(batchId);
    if (!session || !session.onProgress) return;

    const progressUpdate: SigningProgress = {
      batchId,
      transactionId: '', // Will be set by caller if needed
      status,
      progress: Math.min(progress, 100),
      message,
    };

    session.onProgress(progressUpdate);
  }

  private handleBatchError(batchId: string, error: any): void {
    const failed = Array.from(this.activeSignings).map((txId) => ({
      transactionId: txId,
      error: (error as Error).message,
      reason: this.determineErrorReason(error),
      timestamp: Date.now(),
    }));

    const session = this.batchSessions.get(batchId);
    if (session && session.onProgress) {
      session.onProgress({
        batchId,
        transactionId: '',
        status: 'failed',
        progress: 0,
        error: (error as Error).message,
      });
    }
  }

  /**
   * Cancel an ongoing batch signing
   */
  cancelBatch(batchId: string): void {
    const session = this.batchSessions.get(batchId);
    if (session) {
      this.activeSignings.forEach((txId) => this.activeSignings.delete(txId));
      this.batchSessions.delete(batchId);
    }
  }

  /**
   * Get batch status
   */
  getBatchStatus(batchId: string): BatchSigningResponse | null {
    return this.batchResults.get(batchId) || null;
  }

  /**
   * Get batch results
   */
  getBatchResults(batchId: string): BatchSigningResponse | null {
    return this.batchResults.get(batchId) || null;
  }

  /**
   * Clear completed batch results
   */
  clearBatchResults(batchId: string): void {
    this.batchResults.delete(batchId);
  }

  /**
   * Clear all batch data
   */
  clearAllBatches(): void {
    this.batchSessions.clear();
    this.batchResults.clear();
    this.activeSignings.clear();
  }

  private determineErrorReason(error: any): SigningErrorReason {
    const message = (error as Error).message || '';

    if (message.includes('User rejected') || message.includes('rejected')) {
      return 'user_rejected';
    }
    if (message.includes('timeout') || message.includes('Timeout')) {
      return 'timeout';
    }
    if (message.includes('network') || message.includes('Network')) {
      return 'network_error';
    }
    if (message.includes('hardware') || message.includes('Hardware')) {
      return 'hardware_error';
    }
    if (message.includes('insufficient') || message.includes('Insufficient')) {
      return 'insufficient_funds';
    }
    if (message.includes('nonce') || message.includes('Nonce')) {
      return 'nonce_conflict';
    }

    return 'unknown';
  }

  private createSigningError(
    message: string,
    reason: SigningErrorReason,
    requestId: string | null
  ): SigningError {
    const error = new Error(message) as SigningError;
    error.reason = reason;
    error.requestId = requestId || undefined;
    error.retryable = this.isRetryableError(reason);
    return error;
  }

  private isRetryableError(reason: SigningErrorReason): boolean {
    const retryable: SigningErrorReason[] = [
      'network_error',
      'timeout',
      'hardware_error',
    ];
    return retryable.includes(reason);
  }

  private generateBatchId(): string {
    return `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get signing statistics
   */
  getStatistics(): {
    activeBatches: number;
    completedBatches: number;
    totalTransactionsSigned: number;
    totalTransactionsFailed: number;
  } {
    let totalSigned = 0;
    let totalFailed = 0;

    this.batchResults.forEach((result) => {
      totalSigned += result.totalSigned;
      totalFailed += result.totalFailed;
    });

    return {
      activeBatches: this.batchSessions.size,
      completedBatches: this.batchResults.size,
      totalTransactionsSigned: totalSigned,
      totalTransactionsFailed: totalFailed,
    };
  }
}

export const batchSigningService = new BatchSigningService();
