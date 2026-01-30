# Cryptographic Security Documentation

## Overview

This document describes the cryptographic security measures implemented in RenVault to protect sensitive user data.

## Encryption Standards

### AES-GCM Encryption

RenVault uses **AES-GCM (Galois/Counter Mode)** for all encryption operations:

- **Algorithm**: AES-GCM
- **Key Length**: 256 bits
- **IV Length**: 96 bits (12 bytes) - recommended for AES-GCM
- **Authentication**: Built-in authentication tag

AES-GCM provides both confidentiality and authenticity, detecting any tampering with encrypted data.

### Key Derivation

Encryption keys are derived from user passwords using **PBKDF2**:

- **Algorithm**: PBKDF2
- **Hash Function**: SHA-256
- **Iterations**: 100,000 (configurable)
- **Salt Length**: 128 bits (16 bytes)
- **Output Key Length**: 256 bits

This configuration provides strong protection against brute-force attacks.

## Random Number Generation

All random values are generated using the **Web Crypto API**:

```typescript
crypto.getRandomValues(new Uint8Array(length));
```

This is a cryptographically secure pseudo-random number generator (CSPRNG) that provides:
- Unpredictable output
- Uniform distribution
- Suitable for security-sensitive applications

### What Changed

Previous implementations used `Math.random()`, which is **NOT** cryptographically secure:
- Predictable with enough samples
- Not suitable for security purposes
- Subject to state prediction attacks

## Security Utilities

### Secure ID Generation

```typescript
import { generateSecureId, generateSecureUUID } from './utils/crypto';

// Generate a secure ID with prefix
const backupId = generateSecureId('backup', 16);

// Generate a UUID v4
const uuid = generateSecureUUID();
```

### Secure Transaction IDs

```typescript
import { generateSecureTransactionId } from './utils/crypto';

// Generates: 0x + 64 hex characters
const txId = generateSecureTransactionId();
```

### Data Encryption

```typescript
import { encryptForStorage, decryptFromStorage } from './utils/encryption';

// Encrypt sensitive data
const encrypted = await encryptForStorage(sensitiveData, password);

// Decrypt when needed
const decrypted = await decryptFromStorage(encrypted, password);
```

### Data Integrity

```typescript
import { hashData, verifyHash } from './utils/encryption';

// Generate SHA-256 hash
const hash = await hashData(data);

// Verify integrity
const isValid = await verifyHash(data, expectedHash);
```

## Secure Storage

Use `SecureStorageService` for encrypted localStorage:

```typescript
import { SecureStorageService } from './services/storage/SecureStorageService';

const storage = SecureStorageService.getInstance();

// Store encrypted data
await storage.setItem('key', sensitiveData, {
  encrypt: true,
  password: userPassword,
  expirationMs: 24 * 60 * 60 * 1000 // 24 hours
});

// Retrieve and decrypt
const data = await storage.getItem('key', {
  encrypt: true,
  password: userPassword
});
```

## Input Validation

All cryptographic operations validate inputs before processing:

```typescript
import {
  validatePassword,
  validateEncryptionInput,
  requireWebCrypto
} from './utils/cryptoValidation';

// Validates password meets requirements
validatePassword(password);

// Validates data is suitable for encryption
validateEncryptionInput(data);

// Ensures Web Crypto API is available
requireWebCrypto();
```

## Error Handling

Cryptographic errors use typed error codes:

```typescript
import { CryptoError, CryptoErrorCode } from './types/crypto';

try {
  await decryptWithPassword(data, password);
} catch (error) {
  if (error instanceof CryptoError) {
    switch (error.code) {
      case CryptoErrorCode.INVALID_PASSWORD:
        // Handle invalid password
        break;
      case CryptoErrorCode.CORRUPTED_DATA:
        // Handle data corruption
        break;
    }
  }
}
```

## Security Best Practices

### Do's

1. ✅ Always use the provided crypto utilities
2. ✅ Validate all inputs before encryption
3. ✅ Use unique IVs for each encryption
4. ✅ Store encrypted data, not passwords
5. ✅ Verify data integrity with checksums

### Don'ts

1. ❌ Never use `Math.random()` for security
2. ❌ Never store passwords in plain text
3. ❌ Never reuse IVs or salts
4. ❌ Never use deprecated crypto methods
5. ❌ Never skip input validation

## Browser Compatibility

The Web Crypto API is supported in:
- Chrome 37+
- Firefox 34+
- Safari 11+
- Edge 12+

For older browsers, a polyfill may be required.

## References

- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode)
- [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
