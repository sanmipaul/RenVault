export { environment, validateEnvironment } from './environment';
export { walletConnectConfig, supportedChains } from './walletconnect';

import { validateEnvironment } from './environment';

validateEnvironment();
