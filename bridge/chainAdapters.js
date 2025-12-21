// Chain Adapters for Multi-Blockchain Support
class ChainAdapter {
  constructor(chainName) {
    this.chainName = chainName;
    this.connected = false;
  }

  async connect() {
    this.connected = true;
    return true;
  }

  async getBalance(address) {
    throw new Error('Must implement getBalance');
  }

  async transfer(from, to, amount) {
    throw new Error('Must implement transfer');
  }
}

class EthereumAdapter extends ChainAdapter {
  constructor() {
    super('ethereum');
    this.gasPrice = 20000000000; // 20 gwei
  }

  async getBalance(address) {
    // Mock Ethereum balance check
    return Math.floor(Math.random() * 1000000);
  }

  async transfer(from, to, amount) {
    return {
      txHash: '0x' + Buffer.from(Math.random().toString()).toString('hex'),
      gasUsed: 21000,
      success: true
    };
  }
}

class BitcoinAdapter extends ChainAdapter {
  constructor() {
    super('bitcoin');
    this.feeRate = 10; // sat/byte
  }

  async getBalance(address) {
    // Mock Bitcoin balance check
    return Math.floor(Math.random() * 100000000); // satoshis
  }

  async transfer(from, to, amount) {
    return {
      txId: Buffer.from(Math.random().toString()).toString('hex'),
      fee: 1000,
      success: true
    };
  }
}

class AdapterFactory {
  static createAdapter(chainName) {
    switch (chainName.toLowerCase()) {
      case 'ethereum':
        return new EthereumAdapter();
      case 'bitcoin':
        return new BitcoinAdapter();
      default:
        throw new Error(`Unsupported chain: ${chainName}`);
    }
  }

  static getSupportedChains() {
    return ['ethereum', 'bitcoin'];
  }
}

module.exports = { ChainAdapter, EthereumAdapter, BitcoinAdapter, AdapterFactory };