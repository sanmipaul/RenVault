/**
 * EIP-712 Typed Data Signing Service
 * Handles structured data signing (EIP-712 standard)
 */

import {
  EIP712TypedData,
  TypedDataSigningRequest,
  TypedDataSigningResponse,
  SigningError,
} from '../types/signing';
import { keccak256, toUtf8Bytes, solidityPack } from 'ethers';

class EIP712SigningService {
  private readonly EIP712DOMAIN_TYPEHASH =
    '0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b8ee8d0d4f628e5c1ba1c3b265e';

  private cachedSignatures: Map<string, TypedDataSigningResponse> = new Map();

  /**
   * Sign typed data following EIP-712 standard
   */
  async signTypedData(
    request: TypedDataSigningRequest
  ): Promise<TypedDataSigningResponse> {
    try {
      // Validate typed data
      this.validateTypedData(request.typedData);

      // Compute domain separator
      const domainSeparator = this.computeDomainSeparator(
        request.typedData.domain
      );

      // Encode data
      const messageHash = this.encodeData(
        request.typedData.primaryType,
        request.typedData.message,
        request.typedData.types
      );

      // Compute final hash
      const digest = this.computeEIP712Digest(domainSeparator, messageHash);

      // Sign the digest (in real implementation, would call WalletKit)
      const signature = await this.signDigest(
        request.topic,
        digest,
        request.account
      );

      const response: TypedDataSigningResponse = {
        requestId: this.generateRequestId(),
        signature,
        signatureFormat: 'hex',
        publicKey: request.account,
        timestamp: Date.now(),
        typedDataHash: digest,
      };

      // Cache the signature
      this.cachedSignatures.set(response.requestId, response);

      return response;
    } catch (error) {
      throw this.handleSigningError(error);
    }
  }

  /**
   * Compute EIP-712 domain separator
   */
  private computeDomainSeparator(domain: any): string {
    const types = [
      'bytes32',
      'bytes32',
      'bytes32',
      'uint256',
      'address',
    ];
    const values = [
      this.EIP712DOMAIN_TYPEHASH,
      this.hashString(domain.name || ''),
      this.hashString(domain.version || ''),
      domain.chainId || 1,
      domain.verifyingContract || '0x0000000000000000000000000000000000000000',
    ];

    return keccak256(solidityPack(types, values));
  }

  /**
   * Encode structured data following EIP-712
   */
  private encodeData(
    primaryType: string,
    data: Record<string, any>,
    types: Record<string, any>
  ): string {
    const encoded = [this.hashType(primaryType, types)];

    const typeFields = types[primaryType];
    if (!typeFields) {
      throw this.createSigningError(
        `Type "${primaryType}" not found in types definition`,
        'invalid_request'
      );
    }

    for (const field of typeFields) {
      const value = data[field.name];
      encoded.push(this.encodeField(field.type, value, types));
    }

    return keccak256(solidityPack(
      Array(encoded.length).fill('bytes32'),
      encoded
    ));
  }

  /**
   * Hash a type string
   */
  private hashType(typeName: string, types: Record<string, any>): string {
    const typeFields = types[typeName];
    if (!typeFields) {
      throw this.createSigningError(
        `Type "${typeName}" not found`,
        'invalid_request'
      );
    }

    const typeString = `${typeName}(${typeFields
      .map((f: any) => `${f.type} ${f.name}`)
      .join(',')})`;

    return keccak256(toUtf8Bytes(typeString));
  }

  /**
   * Encode a single field
   */
  private encodeField(
    type: string,
    value: any,
    types: Record<string, any>
  ): string {
    // Handle dynamic types
    if (type === 'string') {
      return keccak256(toUtf8Bytes(value));
    }
    if (type === 'bytes') {
      return keccak256(value);
    }
    if (type === 'bytes32') {
      return value;
    }
    if (type === 'address') {
      return value.toLowerCase().padStart(64, '0');
    }
    if (type === 'bool') {
      return value ? '0x01' : '0x00';
    }
    if (type.startsWith('uint')) {
      return value.toString(16).padStart(64, '0');
    }
    if (type.startsWith('int')) {
      return value.toString(16).padStart(64, '0');
    }
    if (type.endsWith('[]')) {
      // Array type
      const baseType = type.slice(0, -2);
      const encoded = value.map((v: any) =>
        this.encodeField(baseType, v, types)
      );
      return keccak256(solidityPack(
        Array(encoded.length).fill('bytes32'),
        encoded
      ));
    }
    if (types[type]) {
      // Struct type
      return this.encodeData(type, value, types);
    }

    throw this.createSigningError(
      `Unknown type: ${type}`,
      'invalid_request'
    );
  }

  /**
   * Compute final EIP-712 digest
   */
  private computeEIP712Digest(
    domainSeparator: string,
    messageHash: string
  ): string {
    return keccak256(
      solidityPack(
        ['bytes2', 'bytes32', 'bytes32'],
        ['0x1901', domainSeparator, messageHash]
      )
    );
  }

  /**
   * Hash a string value
   */
  private hashString(value: string): string {
    return keccak256(toUtf8Bytes(value));
  }

  /**
   * Sign the computed digest
   */
  private async signDigest(
    topic: string,
    digest: string,
    account: string
  ): Promise<string> {
    // In real implementation, would call WalletKit Sign API
    // For now, returning mock signature
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('0x' + Array(130).fill(0).join(''));
      }, 500);
    });
  }

  /**
   * Verify a typed data signature
   */
  async verifyTypedDataSignature(
    typedData: EIP712TypedData,
    signature: string,
    address: string
  ): Promise<boolean> {
    try {
      const domainSeparator = this.computeDomainSeparator(
        typedData.domain
      );
      const messageHash = this.encodeData(
        typedData.primaryType,
        typedData.message,
        typedData.types
      );
      const digest = this.computeEIP712Digest(domainSeparator, messageHash);

      // In real implementation, would verify signature against digest
      // For now, returning true for valid format
      return signature.startsWith('0x') && signature.length === 132;
    } catch {
      return false;
    }
  }

  /**
   * Validate typed data structure
   */
  private validateTypedData(typedData: EIP712TypedData): void {
    if (!typedData.types || typeof typedData.types !== 'object') {
      throw this.createSigningError(
        'Invalid types: must be an object',
        'invalid_request'
      );
    }

    if (!typedData.primaryType || typeof typedData.primaryType !== 'string') {
      throw this.createSigningError(
        'Invalid primaryType: must be a string',
        'invalid_request'
      );
    }

    if (!typedData.domain || typeof typedData.domain !== 'object') {
      throw this.createSigningError(
        'Invalid domain: must be an object',
        'invalid_request'
      );
    }

    if (!typedData.message || typeof typedData.message !== 'object') {
      throw this.createSigningError(
        'Invalid message: must be an object',
        'invalid_request'
      );
    }

    // Validate that primaryType exists in types
    if (!typedData.types[typedData.primaryType]) {
      throw this.createSigningError(
        `Primary type "${typedData.primaryType}" not found in types`,
        'invalid_request'
      );
    }
  }

  /**
   * Get cached signature
   */
  getSignature(requestId: string): TypedDataSigningResponse | null {
    return this.cachedSignatures.get(requestId) || null;
  }

  /**
   * Clear cached signatures
   */
  clearSignatures(): void {
    this.cachedSignatures.clear();
  }

  /**
   * Get signature statistics
   */
  getStatistics(): {
    totalSigned: number;
    cachedSignatures: number;
  } {
    return {
      totalSigned: this.cachedSignatures.size,
      cachedSignatures: this.cachedSignatures.size,
    };
  }

  private generateRequestId(): string {
    return `eip712-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
    signingError.reason = 'unknown';
    signingError.retryable = false;
    return signingError;
  }
}

export const eip712SigningService = new EIP712SigningService();
