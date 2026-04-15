// Asset Registry Management
const { AssetValidator } = require('./assetValidator');

const supportedAssets = {
  STX: {
    name: 'Stacks',
    symbol: 'STX',
    decimals: 6,
    type: 'native'
  },
  sBTC: {
    name: 'Stacks Bitcoin',
    symbol: 'sBTC',
    decimals: 8,
    type: 'sip010',
    contract: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.sbtc-token'
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
  },
  WELSH: {
    name: 'Welshcorgicoin',
    symbol: 'WELSH',
    decimals: 6,
    type: 'sip010',
    contract: 'SP3NE50G7MKSREFCP4S265AD07V19999999999999.welshcorgicoin-token'
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

  getContract(symbol) {
    return this.assets[symbol]?.contract;
  }

  getType(symbol) {
    return this.assets[symbol]?.type;
  }

  getDecimals(symbol) {
    return this.assets[symbol]?.decimals || 6;
  }

  getAssetOrThrow(symbol) {
    const asset = this.assets[symbol];
    if (!asset) throw new Error(`Asset "${symbol}" is not supported by the registry`);
    return asset;
  }

  addAsset(symbol, config) {
    if (!AssetValidator.isValidSymbol(symbol)) {
      throw new Error(`Invalid asset symbol "${symbol}". Must be 2-10 uppercase alphanumeric characters.`);
    }
    if (!config || typeof config !== 'object') {
      throw new Error('Asset config must be a non-null object');
    }
    if (!['native', 'sip010'].includes(config.type)) {
      throw new Error(`Asset type must be "native" or "sip010", got "${config.type}"`);
    }
    if (config.type === 'sip010') {
      if (!AssetValidator.validateAssetContract(config.contract)) {
        throw new Error(`Invalid contract address for SIP-010 asset: "${config.contract}"`);
      }
    }
    if (typeof config.decimals !== 'number' || !Number.isInteger(config.decimals) || config.decimals < 0 || config.decimals > 18) {
      throw new Error('Asset decimals must be an integer between 0 and 18');
    }
    this.assets[symbol] = config;
  }
}

module.exports = { AssetRegistry, supportedAssets };