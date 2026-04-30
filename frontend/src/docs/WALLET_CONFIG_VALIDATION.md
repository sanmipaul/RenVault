# Wallet Configuration System

## Overview
This document describes the wallet configuration validation and error handling system.

## Components

### Validators
- `walletConfigValidator.ts` - Validates wallet configurations (id, name, imageUrl, homepage, downloadUrls, mobile, desktop, chains, supportedPlatforms)
- `themeValidator.ts` - Validates theme variables
- `chainValidator.ts` - Validates chain configurations
- `modalValidator.ts` - Validates modal configurations
- `brandingValidator.ts` - Validates branding configurations
- `urlValidator.ts` - Validates URLs (HTTPS, relative, deep links, image extensions)
- `walletProviderValidator.ts` - Validates wallet providers

### Utilities
- `walletConfigHelpers.ts` - Safe getters, validation summaries, and batch helpers
- `configInitializer.ts` - Configuration initialization guard
- `configExporter.ts` - Configuration export for debugging

### Components
- `WalletConfigErrorBoundary.tsx` - Error boundary that also renders validation warnings

## URL Validation Rules

| Field | Rule |
|---|---|
| `imageUrl` | Must be a relative path (`/...`) or HTTPS URL ending in `.svg`, `.png`, `.jpg`, `.jpeg`, `.webp`, or `.gif` |
| `homepage` | Must be a valid HTTPS URL |
| `downloadUrls.*` | Each platform URL must be a valid HTTPS URL |
| `mobile.native` | Must be a valid deep link (e.g. `wallet://`) |
| `mobile.universal` | Must be a valid HTTPS URL |
| `desktop.native` | Must be a valid deep link (e.g. `wallet://`) |
| `desktop.universal` | Must be a valid HTTPS URL |

## Errors vs Warnings

`ValidationResult` now contains both `errors` and `warnings`:

- **errors** — block the wallet from being used; `valid` will be `false`
- **warnings** — informational; `valid` can still be `true`

```typescript
import { validateWalletConfig } from './utils/walletConfigValidator';

const result = validateWalletConfig(walletConfig);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
if (result.warnings.length > 0) {
  console.warn('Validation warnings:', result.warnings);
}
```

## Batch Validation

```typescript
import { validateWalletConfigBatch } from './utils/walletConfigValidator';
import { stacksWallets } from './config/customWallets';

const results = validateWalletConfigBatch(stacksWallets);
results.forEach(({ walletId, result }) => {
  if (!result.valid) console.error(`${walletId} has errors`, result.errors);
});
```

## Helper Utilities

```typescript
import {
  hasValidationErrors,
  hasValidationWarnings,
  getErrorFields,
  getWarningFields,
} from './utils/walletConfigValidator';

import {
  getValidationSummary,
  validateAllStacksWallets,
  getWalletsWithErrors,
  getWalletsWithWarnings,
  isWalletConfigValid,
} from './utils/walletConfigHelpers';
```
