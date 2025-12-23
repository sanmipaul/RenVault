# Environment Configuration Guide

## Quick Start

### 1. Get Your PROJECT_ID

Visit [WalletConnect Dashboard](https://dashboard.walletconnect.com/) and create a new project:
- Copy your `PROJECT_ID` from the dashboard
- Keep it secure and never commit to version control

### 2. Create .env.local File

Create `frontend/.env.local`:

```env
VITE_WALLETCONNECT_PROJECT_ID=your_actual_project_id
VITE_APP_NAME=RenVault Wallet
VITE_APP_DESCRIPTION=RenVault Web Wallet with WalletConnect
VITE_APP_URL=http://localhost:3000
VITE_APP_ICON=http://localhost:3000/logo.png
```

### 3. Verify Configuration

```bash
cd frontend
npm install
npm run dev
```

Check console for validation messages.

## Environment Variables Reference

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `VITE_WALLETCONNECT_PROJECT_ID` | Yes | None | WalletConnect project ID |
| `VITE_APP_NAME` | No | RenVault Wallet | Application display name |
| `VITE_APP_DESCRIPTION` | No | RenVault Web Wallet | Short description |
| `VITE_APP_URL` | No | http://localhost:3000 | Application URL |
| `VITE_APP_ICON` | No | Empty | Application icon URL |

## Environment Files

- `.env.example` - Template for all variables
- `.env.development` - Development defaults
- `.env.production` - Production defaults
- `.env.local` - Local overrides (not committed)

## Security Checklist

- [ ] Add `.env.local` to `.gitignore`
- [ ] Never share PROJECT_ID publicly
- [ ] Use different PROJECT_IDs for dev/prod
- [ ] Keep relay URLs up-to-date
- [ ] Validate environment on app startup

## Troubleshooting

**Error: VITE_WALLETCONNECT_PROJECT_ID is required**
- Ensure `.env.local` exists with valid PROJECT_ID
- Check environment variable spelling

**Error: Invalid environment configuration**
- Run: `echo $VITE_WALLETCONNECT_PROJECT_ID`
- Verify no spaces in values

**CORS errors on connection**
- Add your domain to WalletConnect Dashboard
- Check allowed origins in project settings
