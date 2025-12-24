// Price Validator
class PriceValidator {
  constructor() {
    this.priceHistory = new Map();
    this.thresholds = {
      maxDeviation: 0.1,     // 10% max deviation from average
      maxPriceChange: 0.2,   // 20% max price change
      minSources: 2,         // Minimum 2 sources required
      maxAge: 300000         // 5 minutes max age
    };
  }

  validatePrice(symbol, priceData) {
    const validations = [];

    // Check source count
    if (priceData.sources < this.thresholds.minSources) {
      validations.push({
        type: 'INSUFFICIENT_SOURCES',
        severity: 'HIGH',
        message: `Only ${priceData.sources} sources available, minimum ${this.thresholds.minSources} required`
      });
    }

    // Check deviation
    if (priceData.deviation > this.thresholds.maxDeviation) {
      validations.push({
        type: 'HIGH_DEVIATION',
        severity: 'MEDIUM',
        message: `Price deviation ${(priceData.deviation * 100).toFixed(1)}% exceeds threshold`
      });
    }

    // Check price change
    const lastPrice = this.getLastPrice(symbol);
    if (lastPrice) {
      const priceChange = Math.abs(priceData.price - lastPrice.price) / lastPrice.price;
      if (priceChange > this.thresholds.maxPriceChange) {
        validations.push({
          type: 'LARGE_PRICE_CHANGE',
          severity: 'HIGH',
          message: `Price change ${(priceChange * 100).toFixed(1)}% exceeds threshold`
        });
      }
    }

    // Check age
    const age = Date.now() - priceData.timestamp;
    if (age > this.thresholds.maxAge) {
      validations.push({
        type: 'STALE_DATA',
        severity: 'HIGH',
        message: `Price data is ${Math.floor(age / 1000)} seconds old`
      });
    }

    return {
      valid: validations.filter(v => v.severity === 'HIGH').length === 0,
      warnings: validations.filter(v => v.severity === 'MEDIUM'),
      errors: validations.filter(v => v.severity === 'HIGH'),
      score: this.calculateScore(validations)
    };
  }

  calculateScore(validations) {
    let score = 100;
    
    for (const validation of validations) {
      if (validation.severity === 'HIGH') score -= 30;
      if (validation.severity === 'MEDIUM') score -= 10;
      if (validation.severity === 'LOW') score -= 5;
    }

    return Math.max(0, score);
  }

  updatePriceHistory(symbol, priceData) {
    if (!this.priceHistory.has(symbol)) {
      this.priceHistory.set(symbol, []);
    }

    const history = this.priceHistory.get(symbol);
    history.push({
      price: priceData.price,
      timestamp: priceData.timestamp,
      sources: priceData.sources,
      deviation: priceData.deviation
    });

    // Keep only last 100 entries
    if (history.length > 100) {
      history.shift();
    }
  }

  getLastPrice(symbol) {
    const history = this.priceHistory.get(symbol);
    return history && history.length > 0 ? history[history.length - 1] : null;
  }

  getPriceHistory(symbol, limit = 50) {
    const history = this.priceHistory.get(symbol) || [];
    return history.slice(-limit);
  }

  setThreshold(type, value) {
    if (this.thresholds.hasOwnProperty(type)) {
      this.thresholds[type] = value;
      return true;
    }
    return false;
  }

  getThresholds() {
    return { ...this.thresholds };
  }

  analyzeMarketConditions(symbol) {
    const history = this.getPriceHistory(symbol, 20);
    if (history.length < 5) return { condition: 'INSUFFICIENT_DATA' };

    const prices = history.map(h => h.price);
    const volatility = this.calculateVolatility(prices);
    const trend = this.calculateTrend(prices);

    return {
      condition: this.classifyCondition(volatility, trend),
      volatility,
      trend,
      confidence: Math.min(history.length / 20, 1)
    };
  }

  calculateVolatility(prices) {
    if (prices.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }

    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  calculateTrend(prices) {
    if (prices.length < 2) return 0;
    
    const first = prices[0];
    const last = prices[prices.length - 1];
    
    return (last - first) / first;
  }

  classifyCondition(volatility, trend) {
    if (volatility > 0.05) return 'HIGH_VOLATILITY';
    if (Math.abs(trend) > 0.1) return trend > 0 ? 'STRONG_UPTREND' : 'STRONG_DOWNTREND';
    if (Math.abs(trend) > 0.02) return trend > 0 ? 'UPTREND' : 'DOWNTREND';
    return 'STABLE';
  }
}

module.exports = { PriceValidator };