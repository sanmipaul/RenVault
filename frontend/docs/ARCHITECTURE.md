# WalletKit Integration Architecture

## Overview

RenVault Wallet integrates WalletConnect to enable seamless dApp connectivity with web-based wallets.

## Directory Structure

```
frontend/
├── src/
│   ├── config/           # Configuration management
│   ├── constants/        # Static constants and error definitions
│   ├── context/          # React context providers
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # Business logic services
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── App.tsx          # Root component
├── docs/                # Documentation
└── package.json         # Dependencies
```

## Key Components

### Config Layer
- `environment.ts` - Environment variable management
- `walletconnect.ts` - WalletConnect configuration
- `index.ts` - Config exports

### Context Layer
- `WalletKitProvider.tsx` - WalletKit context provider

### Service Layer
- `walletkit-service.ts` - WalletKit business logic

### Hook Layer
- `useWalletKit.ts` - Initialize WalletKit
- `useEnvironment.ts` - Environment validation

### Component Layer
- `WalletConnect.tsx` - Main connection component
- `SessionProposalModal.tsx` - Session approval UI

## Data Flow

1. **Initialization**: App initializes WalletKit via Core instance
2. **Session Proposal**: dApp sends connection request
3. **User Approval**: User approves session in modal
4. **Session Active**: Wallet ready for requests
5. **Request Handling**: Process signing requests
6. **Response**: Send signed data back to dApp

## Environment Variables

All environment variables are validated at startup:
- `VITE_WALLETCONNECT_PROJECT_ID` (required)
- `VITE_APP_NAME` (optional)
- `VITE_APP_DESCRIPTION` (optional)
- `VITE_APP_URL` (optional)
- `VITE_APP_ICON` (optional)

## Error Handling

Errors are categorized and logged using the centralized logger:
- WalletConnect errors
- Environment errors
- UI errors

## Type Safety

All types are defined in `src/types/walletkit.ts`:
- `WalletKitSession` - Active session structure
- `SessionProposal` - Incoming proposal structure
- `SessionRequest` - RPC request structure
