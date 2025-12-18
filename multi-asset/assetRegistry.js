// Asset Registry Management
const supportedAssets = {
  STX: {
    name: 'Stacks',
    symbol: 'STX',
    decimals: 6,
    type: 'native'
  },
  USDA: {
    name: 'USDA Stablecoin',
    symbol: 'USDA',
    decimals: 6,
    type: 'sip010',
    contract: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token'
  },
  ALEX: {
    name: 'Alex Token',
    symbol: 'ALEX',
    decimals: 8,
    type: 'sip010',
    contract: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.alex-token'
  }
};

class AssetRegistry {
  constructor() {
    this.assets = supportedAssets;
  }

  getAsset(symbol) {
    return this.assets[symbol];
  }

  getAllAssets() {
    return Object.values(this.assets);
  }

  isSupported(symbol) {
    return symbol in this.assets;
  }

  addAsset(symbol, config) {
    this.assets[symbol] = config;
  }
}

module.exports = { AssetRegistry, supportedAssets };