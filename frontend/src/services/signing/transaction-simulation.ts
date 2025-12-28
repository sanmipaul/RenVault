/**
 * Transaction Simulation Service
 * Simulates transactions before signing to detect issues and estimate gas
 */

import { SignTransaction, SimulationResult, TransactionSimulation } from '../types/signing';

class TransactionSimulationService {
  private simulationCache: Map<string, TransactionSimulation> = new Map();
  private simulationHistory: TransactionSimulation[] = [];

  /**
   * Simulate a single transaction
   */
  async simulateTransaction(tx: SignTransaction): Promise<TransactionSimulation> {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(tx);
      const cached = this.simulationCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Perform simulation
      const gasEstimate = await this.estimateGas(tx);
      const result = await this.runSimulation(tx);

      const simulation: TransactionSimulation = {
        transactionId: tx.id,
        success: result.status === 'success',
        gasEstimate,
        gasUsed: result.gasUsed?.toString(),
        revertReason: result.status === 'failure' ? result.output : undefined,
        simulationResult: result,
        warnings: this.checkWarnings(tx, result),
      };

      // Cache and log
      this.simulationCache.set(cacheKey, simulation);
      this.simulationHistory.push(simulation);

      return simulation;
    } catch (error) {
      const simulation: TransactionSimulation = {
        transactionId: tx.id,
        success: false,
        gasEstimate: '0',
        revertReason: (error as Error).message,
        warnings: [(error as Error).message],
      };

      this.simulationHistory.push(simulation);
      return simulation;
    }
  }

  /**
   * Simulate batch transactions
   */
  async simulateTransactions(
    transactions: SignTransaction[]
  ): Promise<TransactionSimulation[]> {
    const results: TransactionSimulation[] = [];

    for (const tx of transactions) {
      const result = await this.simulateTransaction(tx);
      results.push(result);
    }

    return results;
  }

  /**
   * Estimate gas for transaction
   */
  private async estimateGas(tx: SignTransaction): Promise<string> {
    try {
      // Simulate gas estimation
      // In real implementation, would call eth_estimateGas or similar
      const baseGas = 21000; // Base transaction cost
      const dataGas = this.calculateDataGas(tx.data || '');
      const executionGas = Math.floor(Math.random() * 50000) + 10000;

      const totalGas = baseGas + dataGas + executionGas;
      return totalGas.toString();
    } catch {
      return '21000';
    }
  }

  /**
   * Calculate gas cost for data
   */
  private calculateDataGas(data: string): number {
    if (!data) return 0;

    const hexData = data.startsWith('0x') ? data.slice(2) : data;
    let gas = 0;

    for (let i = 0; i < hexData.length; i += 2) {
      const byte = hexData.slice(i, i + 2);
      if (byte === '00') {
        gas += 4; // 4 gas per zero byte
      } else {
        gas += 16; // 16 gas per non-zero byte
      }
    }

    return gas;
  }

  /**
   * Run actual simulation
   */
  private async runSimulation(tx: SignTransaction): Promise<SimulationResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock simulation - randomly succeed or fail
        const success = Math.random() > 0.1; // 90% success rate

        if (success) {
          resolve({
            status: 'success',
            gasUsed: Math.floor(Math.random() * 100000) + 21000,
            logs: ['Transfer(indexed address from, indexed address to, uint256 value)'],
          });
        } else {
          resolve({
            status: 'failure',
            output: 'Insufficient balance',
            gasUsed: 21000,
            logs: [],
          });
        }
      }, 200);
    });
  }

  /**
   * Check for warnings in simulation
   */
  private checkWarnings(
    tx: SignTransaction,
    result: SimulationResult
  ): string[] {
    const warnings: string[] = [];

    // Check if gas is low
    if (result.gasUsed && result.gasUsed > 1000000) {
      warnings.push('High gas usage detected');
    }

    // Check for revert
    if (result.status === 'failure') {
      warnings.push(`Transaction would revert: ${result.output}`);
    }

    // Check for potential issues
    if (!tx.metadata?.from) {
      warnings.push('Missing sender address');
    }

    if (!tx.metadata?.to && tx.metadata?.data) {
      warnings.push('Contract creation transaction - verify contract code');
    }

    return warnings;
  }

  /**
   * Get simulation result
   */
  getSimulation(transactionId: string): TransactionSimulation | null {
    return (
      this.simulationHistory.find((s) => s.transactionId === transactionId) ||
      null
    );
  }

  /**
   * Get all simulations for batch
   */
  getSimulationsByIds(transactionIds: string[]): TransactionSimulation[] {
    return this.simulationHistory.filter((s) =>
      transactionIds.includes(s.transactionId)
    );
  }

  /**
   * Check if transaction is safe to sign
   */
  isSafeToSign(simulation: TransactionSimulation): boolean {
    return (
      simulation.success &&
      (!simulation.warnings || simulation.warnings.length === 0)
    );
  }

  /**
   * Get simulation statistics
   */
  getStatistics(): {
    totalSimulations: number;
    successfulSimulations: number;
    failedSimulations: number;
    successRate: number;
    averageGasUsed: string;
  } {
    const total = this.simulationHistory.length;
    const successful = this.simulationHistory.filter((s) => s.success).length;
    const failed = total - successful;

    const gasValues = this.simulationHistory
      .map((s) => {
        const gasUsed = s.gasUsed || s.simulationResult?.gasUsed || 21000;
        return typeof gasUsed === 'string' ? parseInt(gasUsed, 10) : gasUsed;
      })
      .filter((g) => !isNaN(g));

    const avgGas =
      gasValues.length > 0
        ? (gasValues.reduce((a, b) => a + b, 0) / gasValues.length).toFixed(0)
        : '21000';

    return {
      totalSimulations: total,
      successfulSimulations: successful,
      failedSimulations: failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      averageGasUsed: avgGas,
    };
  }

  /**
   * Clear simulation cache
   */
  clearCache(): void {
    this.simulationCache.clear();
  }

  /**
   * Clear simulation history
   */
  clearHistory(): void {
    this.simulationHistory = [];
  }

  /**
   * Clear all data
   */
  clearAll(): void {
    this.clearCache();
    this.clearHistory();
  }

  private generateCacheKey(tx: SignTransaction): string {
    return `${tx.id}-${tx.data}`;
  }
}

export const transactionSimulationService = new TransactionSimulationService();
