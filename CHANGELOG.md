# Changelog

## [Unreleased]

### Added — feat/add-wallet-config-url-validation

- `urlValidator.ts`: Added `isValidHttpsUrl`, `isValidHttpOrHttpsUrl`, `isValidImageUrlStrict`, `isValidDeepLinkUrl`, `isValidWalletHomepage`, `isValidDownloadUrl`, `isValidMobileNativeUrl`, `isValidMobileUniversalUrl`, `getUrlValidationError`, `normalizeUrl`, `extractDomain`, `isSameDomain`
- `walletConfigValidator.ts`: Full URL format validation for `imageUrl` (extension check), `homepage` (HTTPS), `downloadUrls` (HTTPS + trusted store domain), `mobile.native` (deep link), `mobile.universal` (HTTPS), `desktop.native` (deep link), `desktop.universal` (HTTPS), `chains` (known Stacks chain IDs), `supportedPlatforms` (known values), `imageAlt` (accessibility warning), `description` (length warning)
- `walletConfigValidator.ts`: Added `validateWalletId`, `validateWalletName`, `validateWalletConfigBatch`, `validateWalletConfigStrict`, `hasValidationErrors`, `hasValidationWarnings`, `getErrorFields`, `getWarningFields`
- `types/walletConfig.ts`: Added `WalletConfigErrorCode`, `warnings` array to `ValidationResult`, `UrlValidationOptions`
- `customWallets.ts`: Added `supportedPlatforms` field to all wallet configs; `SupportedPlatform` type
- `brandingValidator.ts`: Uses `isValidImageUrlStrict` for logo, `isValidHttpsUrl` for termsUrl/privacyUrl/supportUrl
- `chainValidator.ts`: Validates `rpcUrl` and `explorerUrl` as HTTPS URLs
- `walletProviderValidator.ts`: Validates provider `homepage` as HTTPS URL
- `connectionValidator.ts`: Added `validateConnectionEndpoint`
- `connectionDiagnostics.ts`: Added `validateEndpointUrl`
- `walletkit-helpers.ts`: Validates redirect URLs before navigating
- `env-validator.ts`: Validates `REACT_APP_URL` and `REACT_APP_ICON` as proper URLs
- `configMonitor.ts`: Added `validationWarnings` counter
- `configExporter.ts`: Includes wallet validation results in exported snapshot
- `configInitializer.ts`: Includes wallet URL validation in startup checks
- `walletConfigHelpers.ts`: Added `getValidationSummary`, `validateAllStacksWallets`, `getWalletsWithErrors`, `getWalletsWithWarnings`, `isWalletConfigValid`
- `WalletConfigErrorBoundary.tsx`: Renders validation warnings as accessible alert
- `WalletRecommendations.tsx`: Guards `logoUrl` and `downloadUrl` with URL validators
- `walletconnect.ts`: Logs validation warnings; adds `relayUrlValid` flag
- Tests: Comprehensive test suites for `urlValidator` and `walletConfigValidator`
