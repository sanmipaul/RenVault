# Wallet Configuration System

## Overview
This document describes the wallet configuration validation and error handling system.

## Components

### Validators
- `walletConfigValidator.ts` - Validates wallet configurations
- `themeValidator.ts` - Validates theme variables
- `chainValidator.ts` - Validates chain configurations
- `modalValidator.ts` - Validates modal configurations
- `brandingValidator.ts` - Validates branding configurations
- `urlValidator.ts` - Validates URLs
- `walletProviderValidator.ts` - Validates wallet providers

### Utilities
- `walletConfigHelpers.ts` - Safe getters for wallet configs
- `configInitializer.ts` - Configuration initialization guard
- `configExporter.ts` - Configuration export for debugging

### Components
- `WalletConfigErrorBoundary.tsx` - Error boundary for wallet configuration

## Usage

### Validating Wallet Configuration
```typescript
import { validateWalletConfig } from './utils/walletConfigValidator';

const result = validateWalletConfig(walletConfig);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```
