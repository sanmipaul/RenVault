# RenVault Frontend

React frontend for the RenVault Clarity 4 micro-savings protocol with AppKit integration.

## Features

- **AppKit Integration**: Modern wallet connection UI with professional account management
- **Account Components**: Built-in balance display, transaction history, and account switching
- **Network Switching**: Easy switching between Stacks networks
- **Mobile Responsive**: Optimized for mobile wallet connections
- **Connect Stacks wallet**: Support for multiple wallet types (browser extensions, mobile wallets)
- **View vault balance and commitment points**: Real-time balance updates
- **Deposit STX with 1% protocol fee**: Secure transaction handling
- **Withdraw STX anytime**: Flexible withdrawal options
- **Real-time transaction status**: Live transaction monitoring

## Wallet Integration

RenVault uses **@reown/appkit** for wallet connectivity, providing:

- **<appkit-account-button />**: Account management with balance display and transaction history
- **<appkit-network-button />**: Network switching capabilities
- **<appkit-button />**: Main connection modal for wallet selection
- **AppKit Modal**: Professional wallet connection interface

## Setup

```bash
cd frontend
npm install
npm start

### AppKit On-Ramp (optional)

To enable the AppKit on-ramp (fiat-to-crypto) flow, set the following environment variables:

- `REACT_APP_APPKIT_ENABLED=true`
- `REACT_APP_APPKIT_API_KEY=your_appkit_api_key_here`
- `REACT_APP_APPKIT_PROVIDER_URL=https://onramp.provider/checkout`
```

## Contract Integration

- **Network**: Stacks Mainnet
- **Contract**: `SP3ESR2PWP83R1YM3S4QJRWPDD886KJ4YFS3FKHPY.ren-vault`
- **Functions**: deposit, withdraw, get-balance, get-points

## Usage

1. Click the **"Connect Wallet"** button (powered by AppKit)
2. Choose your preferred wallet from the modal
3. View your account details using the **Account Button**
4. Switch networks using the **Network Button** if needed
5. Deposit STX to earn points (1% fee applies)
6. Withdraw funds anytime
7. Monitor transactions in the account modal
