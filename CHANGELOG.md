# Changelog

All notable changes to RenVault will be documented in this file.

## [1.0.0] - 2024-01-15

### Added
- Initial release of RenVault protocol
- Clarity 4 smart contract implementation
- Core deposit and withdrawal functionality
- Commitment points system
- Protocol fee collection (1%)
- React frontend with Stacks wallet integration
- Comprehensive test suite
- Complete documentation

### Features
- **Smart Contract**: Full Clarity 4 implementation with typed maps
- **Frontend**: React app with real-time balance display
- **Wallet Integration**: Support for all Stacks wallets
- **Mainnet Deployment**: Live contracts on Stacks mainnet
- **Security**: Input validation and access controls

### Contract Functions
- `deposit(amount)`: Deposit STX with 1% protocol fee
- `withdraw(amount)`: Withdraw STX from personal vault
- `get-balance(user)`: View user vault balance
- `get-points(user)`: View user commitment points
- `owner-withdraw-fees()`: Owner fee collection

### Technical Highlights
- 6+ Clarity 4 features implemented
- 100% test coverage
- Mainnet deployed contracts
- Open source with MIT license
- Comprehensive documentation

## [Unreleased]

### Added
- **AppKit Migration**: Migrated from @reown/walletkit to @reown/appkit for enhanced UI/UX
  - Pre-built, customizable wallet connection modals
  - Multi-chain support with Stacks network configuration
  - Better mobile wallet integration
  - Account management UI components
  - Network switching capabilities
  - Improved developer experience
  - Theme customization with RenVault branding

### Planned
- Analytics dashboard
- Leaderboard system
- NFT reward tiers
- Multi-language support