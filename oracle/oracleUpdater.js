// Oracle Updater
const { PriceAggregator, mockSources } = require('./priceAggregator');

class OracleUpdater {
  constructor() {
    this.aggregator = new PriceAggregator();
    this.updateInterval = 60000; // 1 minute
    this.symbols = ['STX', 'BTC', 'ETH'];
    this.isRunning = false;
    this.setupSources();
  }

  setupSources() {
    this.aggregator.addSource('coinbase', mockSources.coinbase, 3);
    this.aggregator.addSource('binance', mockSources.binance, 2);
    this.aggregator.addSource('coingecko', mockSources.coingecko, 1);
  }

  async updatePrices() {
    try {
      const updates = await this.aggregator.updatePrices(this.symbols);
      
      for (const [symbol, data] of Object.entries(updates)) {
        await this.submitToContract(symbol, data);
      }

      return { success: true, updates: Object.keys(updates).length };
    } catch (error) {
      console.error('Price update failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async submitToContract(symbol, priceData) {
    // Simulate contract call
    const price = Math.floor(priceData.price * 1000000); // 6 decimals
    
    console.log(`Updating ${symbol}: $${priceData.price.toFixed(4)} (${priceData.sources} sources)`);
    
    // Mock contract interaction
    return {
      symbol,
      price,
      decimals: 6,
      sources: priceData.sources,
      deviation: priceData.deviation
    };
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Oracle updater started');
    
    // Initial update
    this.updatePrices();
    
    // Schedule regular updates
    this.intervalId = setInterval(() => {
      this.updatePrices();
    }, this.updateInterval);
  }

  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    clearInterval(this.intervalId);
    console.log('Oracle updater stopped');
  }

  setUpdateInterval(milliseconds) {
    this.updateInterval = milliseconds;
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  addSymbol(symbol) {
    if (!this.symbols.includes(symbol)) {
      this.symbols.push(symbol);
    }
  }

  removeSymbol(symbol) {
    this.symbols = this.symbols.filter(s => s !== symbol);
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      symbols: this.symbols,
      updateInterval: this.updateInterval,
      sources: Array.from(this.aggregator.sources.keys()),
      lastPrices: this.aggregator.getAllPrices()
    };
  }
}

module.exports = { OracleUpdater };