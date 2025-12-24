# WalletConnect Project Setup Guide

## Overview
This guide walks you through creating a WalletConnect project and obtaining your PROJECT_ID.

## Prerequisites
- GitHub/Email account for WalletConnect Dashboard
- Your wallet application URL

## Step 1: Create WalletConnect Project

1. Visit [WalletConnect Dashboard](https://dashboard.walletconnect.com/)
2. Sign in or create an account
3. Click "Create Project"
4. Fill in project details:
   - Project Name: "RenVault Wallet"
   - Description: "Web wallet with WalletConnect integration"

## Step 2: Configure Project

1. Select wallet type
2. Add your application URL(s):
   - Development: http://localhost:3000
   - Production: https://yourdomain.com

## Step 3: Obtain PROJECT_ID

1. After creating the project, you'll see your PROJECT_ID
2. Copy the PROJECT_ID from the dashboard
3. Save it securely

## Step 4: Configure Environment Variables

Create `.env.local` in the `frontend/` directory:

```env
REACT_APP_WALLETCONNECT_PROJECT_ID=your_project_id_here
REACT_APP_NAME=RenVault Wallet
REACT_APP_DESCRIPTION=RenVault Web Wallet with WalletConnect
REACT_APP_URL=http://localhost:3000
REACT_APP_ICON=http://localhost:3000/logo.png
```

## Step 5: Verify Configuration

Run the development server to verify:

```bash
npm start
```

Check browser console for any WalletConnect errors.

## Security Notes

- Never commit `.env.local` to version control
- Keep PROJECT_ID secure
- Use separate project IDs for development and production
- Rotate keys regularly in production

## Troubleshooting

- **Invalid PROJECT_ID**: Ensure you've copied it correctly from dashboard
- **CORS errors**: Add your URL to project allowed origins
- **Connection issues**: Check network and firewall settings
