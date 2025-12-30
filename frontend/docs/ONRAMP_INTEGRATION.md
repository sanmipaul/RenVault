# On-Ramp Integration (AppKit)

This document explains the AppKit on-ramp integration added for Issue #112.

Configuration
- Set `REACT_APP_APPKIT_ENABLED=true` to enable the feature.
- Provide `REACT_APP_APPKIT_API_KEY` with your AppKit provider API key.
- Optionally set `REACT_APP_APPKIT_PROVIDER_URL` to point to the checkout endpoint.

Usage
- A "Buy STX" button is displayed in the `BalanceDisplay` when AppKit is enabled.
- The button opens the configured provider in a popup and polls the wallet balance to detect successful purchases.

Notes
- This integration uses a lightweight window-open + balance-polling flow as a shim for full SDK integration.
- KYC and provider selection logic should be implemented server-side or via the provider SDK.
