# RenVault Wallet Frontend

Web wallet implementation with WalletConnect integration.

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
cp .env.example .env.local
```

### Add PROJECT_ID

1. Visit [WalletConnect Dashboard](https://dashboard.walletconnect.com/)
2. Create a new project
3. Copy your PROJECT_ID
4. Add to `.env.local`:

```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### Development

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Build

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Documentation

- [Environment Setup](./docs/ENV_SETUP.md)
- [WalletConnect Setup](./docs/WALLETCONNECT_SETUP.md)
- [Architecture](./docs/ARCHITECTURE.md)

## Project Structure

```
frontend/
├── src/
│   ├── App.tsx              # Root component
│   ├── index.tsx            # Entry point
│   ├── config/              # Configuration
│   ├── constants/           # Constants and error definitions
│   ├── context/             # React context
│   ├── components/          # React components
│   ├── hooks/               # Custom hooks
│   ├── services/            # Business logic
│   ├── types/               # TypeScript types
│   └── utils/               # Utilities
├── docs/                    # Documentation
├── scripts/                 # Build scripts
├── package.json
├── tsconfig.json
└── eslintrc.json
```

## Features

- ✅ WalletConnect integration
- ✅ Session proposal handling
- ✅ EVM chain support (Ethereum, Polygon, Arbitrum)
- ✅ Signing request support
- ✅ Environment validation
- ✅ Error handling
- ✅ Type-safe implementation

## Environment Variables

See [ENV_SETUP.md](./docs/ENV_SETUP.md) for details.

## Testing

```bash
npm run test
npm run test:watch
```

## Security

- Never commit `.env.local`
- Use environment-specific configurations
- Validate environment variables on startup
- Use secure relay URLs

## Support

For issues with WalletConnect, visit:
- [WalletConnect Docs](https://docs.walletconnect.network/)
- [WalletConnect Discord](https://discord.walletconnect.network/)
