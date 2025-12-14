# Frontend Setup Guide

## Quick Start

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

## Features

- **Wallet Connection**: Connect any Stacks wallet (Hiro, Xverse, etc.)
- **Real-time Balance**: View your vault balance and commitment points
- **Deposit STX**: Deposit with automatic 1% protocol fee calculation
- **Withdraw STX**: Withdraw your saved funds anytime
- **Transaction Status**: Real-time feedback on transaction status

## Contract Integration

The frontend connects to the deployed mainnet contract:
- **Address**: `SP3ESR2PWP83R1YM3S4QJRWPDD886KJ4YFS3FKHPY`
- **Contract**: `ren-vault`

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

## Environment Variables

Create `.env` file in frontend directory:

```
REACT_APP_CONTRACT_ADDRESS=SP3ESR2PWP83R1YM3S4QJRWPDD886KJ4YFS3FKHPY
REACT_APP_CONTRACT_NAME=ren-vault
REACT_APP_NETWORK=mainnet
```