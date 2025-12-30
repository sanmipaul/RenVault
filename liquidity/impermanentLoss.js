class ImpermanentLossCalculator {
  constructor() {
    this.positions = new Map();
  }

  recordPosition(user, poolId, tokenA, tokenB, amountA, amountB, priceA, priceB) {
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
    const key = `${user}-${poolId}`;
    const position = this.positions.get(key);
    if (!position) return null;

    const { amountA, amountB, initialPriceA, initialPriceB, initialValue } = position;
    
    // Current value if held
    const holdValue = (amountA * currentPriceA) + (amountB * currentPriceB);
    
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