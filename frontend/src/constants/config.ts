export const CONFIG = {
  WALLETCONNECT: {
    RELAY_URL: 'wss://relay.walletconnect.org',
    VERSION: '2.0',
    PROTOCOL: 'wc',
  },
  CHAINS: {
    ETHEREUM: 'eip155:1',
    POLYGON: 'eip155:137',
    ARBITRUM: 'eip155:42161',
    OPTIMISM: 'eip155:10',
    BASE: 'eip155:8453',
  },
  METHODS: {
    ETH_SEND_TRANSACTION: 'eth_sendTransaction',
    ETH_SIGN: 'eth_sign',
    PERSONAL_SIGN: 'personal_sign',
    ETH_SIGN_TYPED_DATA: 'eth_signTypedData',
    ETH_SIGN_TYPED_DATA_V4: 'eth_signTypedData_v4',
  },
  EVENTS: {
    CHAIN_CHANGED: 'chainChanged',
    ACCOUNTS_CHANGED: 'accountsChanged',
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
  },
  TIMEOUT: {
    SESSION_PROPOSAL: 300000,
    SESSION_REQUEST: 300000,
    DEFAULT: 30000,
  },
};

export default CONFIG;
