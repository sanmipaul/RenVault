// Price Aggregator
class PriceAggregator {
  constructor() {
    this.sources = new Map();
    this.prices = new Map();
    this.weights = new Map();
  }

  addSource(name, fetcher, weight = 1) {
    this.sources.set(name, { fetcher, weight, active: true });
    this.weights.set(name, weight);
  }

  async fetchPrice(symbol) {
    const results = [];
    
    for (const [name, source] of this.sources.entries()) {
      if (!source.active) continue;
      
      try {
        const price = await source.fetcher(symbol);
        results.push({
          source: name,
          price: parseFloat(price),
          weight: source.weight,
          timestamp: Date.now()
        });
      } catch (error) {
        console.warn(`Failed to fetch price from ${name}:`, error.message);
      }
    }

    if (results.length === 0) {
      throw new Error('No price sources available');
    }

    return this.calculateWeightedAverage(results);
  }

  calculateWeightedAverage(results) {
    let totalWeightedPrice = 0;
    let totalWeight = 0;

    for (const result of results) {
      totalWeightedPrice += result.price * result.weight;
      totalWeight += result.weight;
    }

    const averagePrice = totalWeightedPrice / totalWeight;
    const deviation = this.calculateDeviation(results, averagePrice);

    return {
      price: averagePrice,
      sources: results.length,
      deviation,
      timestamp: Date.now(),
      details: results
    };
  }

  calculateDeviation(results, average) {
    if (results.length < 2) return 0;

    const variance = results.reduce((sum, result) => {
      return sum + Math.pow(result.price - average, 2);
    }, 0) / results.length;

    return Math.sqrt(variance) / average;
  }

  async updatePrices(symbols) {
    const updates = {};
    
    for (const symbol of symbols) {
      try {
        const priceData = await this.fetchPrice(symbol);
        this.prices.set(symbol, priceData);
        updates[symbol] = priceData;
      } catch (error) {
        console.error(`Failed to update price for ${symbol}:`, error.message);
      }
    }

    return updates;
  }

  getPrice(symbol) {
    return this.prices.get(symbol);
  }

  getAllPrices() {
    return Object.fromEntries(this.prices);
  }

  isStale(symbol, maxAge = 300000) { // 5 minutes
    const price = this.prices.get(symbol);
    if (!price) return true;
    return Date.now() - price.timestamp > maxAge;
  }
}

// Mock price sources
const mockSources = {
  coinbase: async (symbol) => {
    // Simulate API call
    const basePrice = { STX: 0.5, BTC: 45000, ETH: 3000 }[symbol] || 1;
    return basePrice * (0.95 + Math.random() * 0.1);
  },
  
  binance: async (symbol) => {
    const basePrice = { STX: 0.5, BTC: 45000, ETH: 3000 }[symbol] || 1;
    return basePrice * (0.95 + Math.random() * 0.1);
  },
  
  coingecko: async (symbol) => {
    const basePrice = { STX: 0.5, BTC: 45000, ETH: 3000 }[symbol] || 1;
    return basePrice * (0.95 + Math.random() * 0.1);
  }
};

module.exports = { PriceAggregator, mockSources };