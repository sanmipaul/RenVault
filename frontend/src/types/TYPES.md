# RenVault Type System Documentation

## Overview

This document describes the TypeScript type system used throughout the RenVault frontend application. All types are centrally organized in the `src/types` directory and can be imported from `@/types` or `../types`.

## Directory Structure

```
src/types/
├── index.ts          # Central export file
├── api.ts            # API request/response types
├── components.ts     # Component prop types
├── context.ts        # React context types
├── crypto.ts         # Cryptographic types
├── forms.ts          # Form data and validation types
├── hooks.ts          # Hook return types
├── notification.ts   # Notification system types
├── services.ts       # Service interface types
├── transaction.ts    # Transaction types
├── utils.ts          # Utility types
├── walletConnection.ts # Wallet connection types
└── TYPES.md          # This documentation
```

## Usage

### Importing Types

```typescript
// Import from the central index
import { WalletProviderType, TransactionStatus, ApiResponse } from '@/types';

// Or import from specific modules
import type { WalletBalance } from '@/types/walletConnection';
```

### Type Categories

#### 1. Wallet Connection Types (`walletConnection.ts`)

Types for wallet connections, providers, and balances.

```typescript
import {
  WalletProviderType,  // 'leather' | 'xverse' | 'hiro' | ...
  WalletBalance,       // STX + token balances
  WalletErrorCode,     // Error code enum
  MultiSigConfig       // Multi-signature wallet setup
} from '@/types';
```

#### 2. Transaction Types (`transaction.ts`)

Types for blockchain transactions.

```typescript
import {
  TransactionStatus,   // 'pending' | 'success' | 'failed' | ...
  TransactionType,     // 'deposit' | 'withdraw' | 'transfer' | ...
  TransactionDetails,  // Full transaction info
  PostCondition        // Stacks post-conditions
} from '@/types';
```

#### 3. API Types (`api.ts`)

Types for API communication.

```typescript
import {
  ApiResponse,         // Generic API response wrapper
  PaginatedResponse,   // Paginated list response
  ApiError,            // Error response structure
  BalanceResponse      // Account balance response
} from '@/types';

// Generic usage
const response: ApiResponse<UserData> = await api.get('/user');
```

#### 4. Form Types (`forms.ts`)

Types for form handling and validation.

```typescript
import {
  DepositFormData,     // Deposit form fields
  FormState,           // Generic form state
  FieldValidator,      // Validation function type
  FormConfig           // Form configuration
} from '@/types';

const form: FormState<DepositFormData> = {
  values: { amount: '', asset: 'STX' },
  errors: {},
  isSubmitting: false,
  isValid: true
};
```

#### 5. Context Types (`context.ts`)

Types for React context providers.

```typescript
import {
  WalletContextType,   // Wallet provider context
  ThemeContextType,    // Theme provider context
  UserContextType      // User state context
} from '@/types';
```

#### 6. Hook Types (`hooks.ts`)

Return types for custom hooks.

```typescript
import {
  UseWalletReturn,     // useWallet() return type
  UseBalanceReturn,    // useBalance() return type
  UseFormReturn        // useForm() return type
} from '@/types';

function useWallet(): UseWalletReturn {
  // Implementation
}
```

#### 7. Component Props (`components.ts`)

Props for React components.

```typescript
import {
  ButtonProps,          // Button component props
  ModalProps,           // Modal component props
  TransactionHistoryProps // Transaction list props
} from '@/types';

const Button: React.FC<ButtonProps> = ({ variant, onClick, children }) => {
  // Implementation
};
```

#### 8. Service Types (`services.ts`)

Interfaces for service classes.

```typescript
import {
  IWalletService,      // Wallet service interface
  IApiService,         // API service interface
  IStorageService      // Storage service interface
} from '@/types';

class WalletService implements IWalletService {
  // Implementation must satisfy interface
}
```

#### 9. Utility Types (`utils.ts`)

Helper types for common patterns.

```typescript
import {
  Result,              // { success: true, data: T } | { success: false, error: E }
  Nullable,            // T | null
  DeepPartial,         // Recursive partial
  ValidationResult,    // { isValid: boolean, errors: [] }
  Callback             // (value: T) => void
} from '@/types';

// Result pattern for error handling
async function fetchData(): Promise<Result<Data, ApiError>> {
  try {
    const data = await api.get('/data');
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}
```

#### 10. Notification Types (`notification.ts`)

Types for the notification system.

```typescript
import {
  NotificationType,    // 'info' | 'success' | 'warning' | 'error'
  Notification,        // Notification object
  NotificationPreferences // User preferences
} from '@/types';
```

#### 11. Crypto Types (`crypto.ts`)

Types for cryptographic operations.

```typescript
import {
  CryptoError,         // Custom error class
  CryptoErrorCode,     // Error code enum
  EncryptionResult     // Encryption output type
} from '@/types';
```

## Best Practices

### 1. Always Use Explicit Types

```typescript
// Good
const balance: WalletBalance = await getBalance(address);

// Avoid
const balance = await getBalance(address); // Implicit any
```

### 2. Use Type Guards

```typescript
function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'code' in error;
}
```

### 3. Prefer Interfaces for Object Types

```typescript
// Good - extendable
interface UserData {
  id: string;
  name: string;
}

// Use types for unions, primitives, and utilities
type Status = 'active' | 'inactive';
```

### 4. Use Generic Types

```typescript
// Good - reusable
interface ApiResponse<T> {
  data: T;
  status: number;
}

// Usage
type UserResponse = ApiResponse<UserData>;
```

### 5. Export Type-Only When Possible

```typescript
// Optimizes bundle size
export type { UserData, WalletBalance };
```

## Adding New Types

1. Determine the appropriate category/file
2. Add the type definition with JSDoc comments
3. Export from the category file
4. Add to `index.ts` exports
5. Update this documentation

```typescript
/**
 * Description of what this type represents
 * @example
 * const example: NewType = { ... };
 */
export interface NewType {
  field: string;
}
```

## Migrating from `any`

When replacing `any` types:

1. Identify the actual data structure
2. Create an appropriate type/interface
3. Add validation if dealing with external data
4. Update all usages

```typescript
// Before
function processData(data: any): any { ... }

// After
function processData(data: InputData): OutputData { ... }
```

## Type Safety Checklist

- [ ] No `any` types in production code
- [ ] All function parameters are typed
- [ ] All return types are explicit
- [ ] External data is validated
- [ ] Null/undefined handled appropriately
- [ ] Generic types used where applicable
- [ ] Enums used for fixed sets of values
