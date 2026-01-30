# Multi-Asset Vault Contract Changelog

All notable changes to the multi-asset-vault contract are documented here.

## [2.0.0] - 2024

### Critical Bug Fixes
- **Fixed withdraw-stx transfer target bug**: STX withdrawals were transferring to the contract instead of the user due to incorrect tx-sender usage inside as-contract block. Now properly captures sender principal before entering as-contract context.
- **Fixed withdraw-sip010 transfer target bug**: Same issue as withdraw-stx but for SIP010 token withdrawals.

### New Features
- **Owner Fee Withdrawal**: Added `owner-withdraw-stx-fees` and `owner-withdraw-sip010-fees` functions for protocol revenue collection.
- **Asset Management**: Added `remove-supported-asset` function to disable assets from accepting new deposits.
- **Emergency Stop**: Added `pause-contract` and `unpause-contract` functions for emergency situations. Deposits blocked when paused, withdrawals still allowed.
- **Emergency Withdrawal**: Added `emergency-withdraw-stx` and `emergency-withdraw-sip010` for instant full balance withdrawal.
- **Deposit Limits**: Added per-asset maximum deposit limits with `set-max-deposit-limit` function.
- **Withdrawal Minimums**: Added per-asset minimum withdrawal amounts with `set-min-withdrawal-amount` function.
- **TVL Tracking**: Added `total-deposits` map and `get-total-deposits` function for analytics.
- **Contract Versioning**: Added `contract-version` and `contract-name` constants with getter functions.

### Improvements
- **Helper Functions**: Added convenience read functions:
  - `get-stx-balance`: Get user's STX balance
  - `get-total-stx-deposits`: Get total STX TVL
  - `get-stx-fees`: Get accumulated STX fees
  - `get-asset-summary`: Get all asset info in one call
  - `get-user-asset-summary`: Get user info for an asset
- **Events**: Added events for all admin actions (asset-added, asset-removed, contract-paused, etc.)
- **Documentation**: Added comprehensive header comments with feature list and error codes.

### Error Codes
- `u100` - err-owner-only
- `u101` - err-invalid-amount
- `u102` - err-insufficient-balance
- `u103` - err-asset-not-supported
- `u104` - err-transfer-failed
- `u105` - err-not-authorized
- `u106` - err-contract-paused (NEW)
- `u107` - err-exceeds-max-deposit (NEW)
- `u108` - err-below-min-withdrawal (NEW)

## [1.0.0] - Initial Release

### Features
- Basic STX and SIP010 token deposits
- Basic withdrawals
- 1% deposit fee
- Supported assets management
- Balance tracking per user per asset
