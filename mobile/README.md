# RenVault Mobile App

React Native mobile application for the RenVault protocol.

## Features

- **Wallet Integration**: Connect Stacks wallets
- **Balance Tracking**: View vault balance and commitment points
- **Deposit/Withdraw**: Mobile-friendly transaction interface
- **Leaderboard**: View top savers and rankings
- **Cross-platform**: iOS and Android support

## Quick Start

```bash
cd mobile
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Requirements

- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator

## Project Structure

```
mobile/
├── App.js              # Main application component
├── components/         # Reusable UI components
├── services/          # API and blockchain services
├── app.json           # Expo configuration
└── package.json       # Dependencies
```

## Development

1. Install Expo CLI: `npm install -g @expo/cli`
2. Start development server: `npm start`
3. Use Expo Go app to test on device
4. Build for production: `expo build`

## Features Implemented

- Multi-screen navigation
- Wallet connection flow
- Balance and points display
- Deposit/withdraw interfaces
- Leaderboard integration
- Responsive mobile design