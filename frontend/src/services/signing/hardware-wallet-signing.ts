/**
 * Hardware Wallet Signing Service
 * Enhanced Ledger and Trezor signing flows with WalletKit helpers
 */

import {
  HardwareSigningRequest,
  HardwareSigningResponse,
  HardwareWalletConfig,
  SigningError,
} from '../types/signing';

export type HardwareWalletType = 'ledger' | 'trezor' | 'keepkey';

class HardwareWalletSigningService {
  private activeDevices: Map<string, HardwareDeviceInfo> = new Map();
  private signingQueue: HardwareSigningRequest[] = [];
  private signatureCache: Map<string, HardwareSigningResponse> = new Map();

  /**
   * Initialize hardware wallet connection
   */
  async initializeDevice(
    walletType: HardwareWalletType,
    derivationPath: string
  ): Promise<string> {
    try {
      const deviceId = `${walletType}-${Date.now()}`;

      // Simulate device initialization
      await this.connectDevice(walletType, derivationPath);

      const deviceInfo: HardwareDeviceInfo = {
        deviceId,
        type: walletType,
        derivationPath,
        connected: true,
        connectedAt: Date.now(),
        lastUsed: Date.now(),
        firmwareVersion: this.getMockFirmwareVersion(walletType),
      };

      this.activeDevices.set(deviceId, deviceInfo);

      return deviceId;
    } catch (error) {
      throw this.createSigningError(
        `Failed to initialize ${walletType} device`,
        'hardware_error'
      );
    }
  }

  /**
   * Sign a transaction with hardware wallet
   */
  async signWithHardware(
    request: HardwareSigningRequest
  ): Promise<HardwareSigningResponse> {
    try {
      // Validate request
      this.validateHardwareRequest(request);

      // Get or initialize device
      let deviceId = request.hardware.type + '-device';
      if (!this.activeDevices.has(deviceId)) {
        deviceId = await this.initializeDevice(
          request.hardware.type,
          request.hardware.derivationPath
        );
      }

      const device = this.activeDevices.get(deviceId);
      if (!device || !device.connected) {
        throw this.createSigningError(
          'Hardware device not connected',
          'hardware_error'
        );
      }

      // Queue the signing request
      this.signingQueue.push(request);

      // Display on device if configured
      if (request.displayOnDevice) {
        await this.displayOnDevice(device, request);
      }

      // Request user confirmation
      if (request.hardware.confirmationRequired) {
        const confirmed = await this.waitForDeviceConfirmation(
          deviceId,
          request.hardware.timeoutMs || 60000
        );

        if (!confirmed) {
          throw this.createSigningError(
            'User rejected signing on hardware device',
            'user_rejected'
          );
        }
      }

      // Perform signing
      const signature = await this.performHardwareSigning(
        device,
        request
      );

      const response: HardwareSigningResponse = {
        requestId: request.id,
        signature,
        signatureFormat: 'hex',
        timestamp: Date.now(),
        hardwareDeviceId: deviceId,
        userConfirmed: request.hardware.confirmationRequired,
        confirmationTime: Date.now(),
        publicKey: request.data,
      };

      // Cache the signature
      this.signatureCache.set(response.requestId, response);

      // Update device usage
      device.lastUsed = Date.now();

      // Remove from queue
      this.signingQueue = this.signingQueue.filter(
        (r) => r.id !== request.id
      );

      return response;
    } catch (error) {
      throw this.handleSigningError(error);
    }
  }

  /**
   * Batch sign with hardware wallet
   */
  async batchSignWithHardware(
    requests: HardwareSigningRequest[]
  ): Promise<HardwareSigningResponse[]> {
    const responses: HardwareSigningResponse[] = [];
    let lastError: Error | null = null;

    for (const request of requests) {
      try {
        const response = await this.signWithHardware(request);
        responses.push(response);
      } catch (error) {
        lastError = error as Error;
        console.error(
          `Batch signing failed for request ${request.id}:`,
          error
        );

        // Continue with remaining requests or stop based on configuration
        if (!request.hardware.confirmationRequired) {
          continue;
        } else {
          break; // Stop on first failure if confirmation is required
        }
      }
    }

    if (responses.length === 0 && lastError) {
      throw lastError;
    }

    return responses;
  }

  /**
   * Get connected devices
   */
  getConnectedDevices(): HardwareDeviceInfo[] {
    const devices = Array.from(this.activeDevices.values());
    return devices.filter((d) => d.connected);
  }

  /**
   * Disconnect device
   */
  async disconnectDevice(deviceId: string): Promise<void> {
    const device = this.activeDevices.get(deviceId);
    if (device) {
      device.connected = false;
      // In real implementation, would perform cleanup
    }
  }

  /**
   * Get device info
   */
  getDeviceInfo(deviceId: string): HardwareDeviceInfo | null {
    return this.activeDevices.get(deviceId) || null;
  }

  /**
   * Check if device is connected
   */
  isDeviceConnected(deviceId: string): boolean {
    const device = this.activeDevices.get(deviceId);
    return device ? device.connected : false;
  }

  /**
   * Get signature if cached
   */
  getCachedSignature(requestId: string): HardwareSigningResponse | null {
    return this.signatureCache.get(requestId) || null;
  }

  /**
   * Get signing queue status
   */
  getQueueStatus(): {
    pendingRequests: number;
    connectedDevices: number;
    queuedRequests: HardwareSigningRequest[];
  } {
    return {
      pendingRequests: this.signingQueue.length,
      connectedDevices: this.getConnectedDevices().length,
      queuedRequests: [...this.signingQueue],
    };
  }

  /**
   * Clear all sessions
   */
  clearAllSessions(): void {
    this.activeDevices.clear();
    this.signingQueue = [];
    this.signatureCache.clear();
  }

  // Private methods

  private async connectDevice(
    walletType: HardwareWalletType,
    derivationPath: string
  ): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate device connection
        resolve();
      }, 500);
    });
  }

  private getMockFirmwareVersion(walletType: HardwareWalletType): string {
    const versions: Record<HardwareWalletType, string> = {
      ledger: '2.1.0',
      trezor: '1.13.0',
      keepkey: '7.0.0',
    };
    return versions[walletType];
  }

  private async displayOnDevice(
    device: HardwareDeviceInfo,
    request: HardwareSigningRequest
  ): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate display on device
        resolve();
      }, 300);
    });
  }

  private async waitForDeviceConfirmation(
    deviceId: string,
    timeoutMs: number
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false); // Timeout = user didn't confirm
      }, timeoutMs);

      // Simulate user confirmation after delay
      const confirmTimeout = setTimeout(() => {
        clearTimeout(timeout);
        resolve(true);
      }, Math.min(timeoutMs / 2, 5000));
    });
  }

  private async performHardwareSigning(
    device: HardwareDeviceInfo,
    request: HardwareSigningRequest
  ): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate signing operation
        resolve('0x' + Array(130).fill(0).join(''));
      }, 1000);
    });
  }

  private validateHardwareRequest(request: HardwareSigningRequest): void {
    if (!request.hardware) {
      throw this.createSigningError(
        'Hardware configuration missing',
        'invalid_request'
      );
    }

    if (!request.hardware.type || !['ledger', 'trezor', 'keepkey'].includes(request.hardware.type)) {
      throw this.createSigningError(
        'Invalid hardware wallet type',
        'invalid_request'
      );
    }

    if (!request.hardware.derivationPath || !request.hardware.derivationPath.match(/^m\/[0-9'\/]+$/)) {
      throw this.createSigningError(
        'Invalid BIP44 derivation path',
        'invalid_request'
      );
    }

    if (!request.data) {
      throw this.createSigningError(
        'Transaction data is required',
        'invalid_request'
      );
    }
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
    signingError.reason = this.determineErrorReason((error as Error).message);
    signingError.retryable = this.isRetryableError(signingError.reason);
    return signingError;
  }

  private determineErrorReason(message: string): string {
    if (message.includes('rejected')) return 'user_rejected';
    if (message.includes('timeout')) return 'timeout';
    if (message.includes('hardware') || message.includes('device')) {
      return 'hardware_error';
    }
    if (message.includes('network')) return 'network_error';
    return 'unknown';
  }

  private isRetryableError(reason: string): boolean {
    return ['network_error', 'timeout', 'hardware_error'].includes(reason);
  }
}

interface HardwareDeviceInfo {
  deviceId: string;
  type: HardwareWalletType;
  derivationPath: string;
  connected: boolean;
  connectedAt: number;
  lastUsed: number;
  firmwareVersion: string;
}

export const hardwareWalletSigningService = new HardwareWalletSigningService();
