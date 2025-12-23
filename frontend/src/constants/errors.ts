export const WALLETCONNECT_ERRORS = {
  MISSING_PROJECT_ID: 'WalletConnect PROJECT_ID is not configured',
  INVALID_PROJECT_ID: 'WalletConnect PROJECT_ID is invalid',
  INITIALIZATION_FAILED: 'Failed to initialize WalletKit',
  PAIRING_FAILED: 'Failed to pair with dApp',
  SESSION_PROPOSAL_TIMEOUT: 'Session proposal timed out',
  SESSION_REQUEST_TIMEOUT: 'Session request timed out',
  INVALID_NAMESPACE: 'Invalid namespace configuration',
  UNSUPPORTED_CHAIN: 'Chain is not supported by this wallet',
  USER_REJECTED: 'User rejected the action',
};

export const ENVIRONMENT_ERRORS = {
  MISSING_ENV_VAR: 'Required environment variable is missing',
  INVALID_URL: 'Invalid URL format in environment variable',
  INSECURE_URL: 'URL should use HTTPS in production',
};

export const UI_ERRORS = {
  RENDER_FAILED: 'Failed to render component',
  MODAL_MOUNT_FAILED: 'Failed to mount modal',
};

export default {
  WALLETCONNECT_ERRORS,
  ENVIRONMENT_ERRORS,
  UI_ERRORS,
};
