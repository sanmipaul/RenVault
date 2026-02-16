class ImpermanentLossCalculator {
  constructor() {
    this.positions = new Map();
  }

  recordPosition(user, poolId, tokenA, tokenB, amountA, amountB, priceA, priceB) {
    if (!user || !poolId) {
      throw new Error('user and poolId are required');
    }
    if (!tokenA || !tokenB) {
      throw new Error('tokenA and tokenB are required');
    }
    if (typeof priceA !== 'number' || typeof priceB !== 'number' || priceA <= 0 || priceB <= 0) {
      throw new Error('priceA and priceB must be positive numbers');
    }
    if (typeof amountA !== 'number' || typeof amountB !== 'number' || amountA <= 0 || amountB <= 0) {
      throw new Error('amountA and amountB must be positive numbers');
    }
    const key = `${user}-${poolId}`;
    this.positions.set(key, {
      tokenA, tokenB, amountA, amountB,
      initialPriceA: priceA,
      initialPriceB: priceB,
      initialValue: (amountA * priceA) + (amountB * priceB),
      timestamp: Date.now()
    });
  }

  calculateImpermanentLoss(user, poolId, currentPriceA, currentPriceB) {
    if (typeof currentPriceA !== 'number' || typeof currentPriceB !== 'number' || currentPriceA <= 0 || currentPriceB <= 0) {
      throw new Error('current prices must be positive numbers');
    }
    const key = `${user}-${poolId}`;
    const position = this.positions.get(key);
    if (!position) return null;

    const { amountA, amountB, initialPriceA, initialPriceB, initialValue } = position;

    // Current value if held
    const holdValue = (amountA * currentPriceA) + (amountB * currentPriceB);
    if (holdValue === 0) return null;

    // Price ratio change
    const priceRatio = (currentPriceA / currentPriceB) / (initialPriceA / initialPriceB);
    
    // LP value with constant product
    const lpMultiplier = 2 * Math.sqrt(priceRatio) / (1 + priceRatio);
    const lpValue = initialValue * lpMultiplier;
    
    // Impermanent loss
    const impermanentLoss = ((lpValue - holdValue) / holdValue) * 100;
    
    return {
      impermanentLoss: Math.abs(impermanentLoss),
      lpValue,
      holdValue,
      priceRatio,
      isLoss: impermanentLoss < 0
    };
  }

  getPositionHistory(user, poolId) {
    const key = `${user}-${poolId}`;
    return this.positions.get(key);
  }

  calculateBreakEvenFees(user, poolId, currentPriceA, currentPriceB, feesEarned) {
    const lossData = this.calculateImpermanentLoss(user, poolId, currentPriceA, currentPriceB);
    if (!lossData || !lossData.isLoss) return { breakEven: true, feesNeeded: 0 };
    
    const lossAmount = lossData.holdValue - lossData.lpValue;
    const feesNeeded = Math.max(0, lossAmount - feesEarned);
    
    return {
      breakEven: feesEarned >= lossAmount,
      feesNeeded,
      currentFees: feesEarned,
      lossAmount
    };
  }
}

module.exports = ImpermanentLossCalculator;