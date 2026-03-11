// Yield Calculator
class YieldCalculator {
  constructor() {
    this.baseRewardRate = 0.01; // 1% per epoch
    this.compoundingFrequency = 365; // Daily compounding
  }

  calculateSimpleYield(principal, rate, periods) {
    if (typeof principal !== 'number' || principal < 0) throw new TypeError('principal must be a non-negative number');
    if (typeof rate !== 'number' || rate < 0) throw new TypeError('rate must be a non-negative number');
    if (typeof periods !== 'number' || periods < 0) throw new TypeError('periods must be a non-negative number');
    return principal * rate * periods;
  }

  calculateCompoundYield(principal, rate, periods, compoundingFrequency = this.compoundingFrequency) {
    if (typeof principal !== 'number' || principal < 0) throw new TypeError('principal must be a non-negative number');
    if (typeof rate !== 'number' || rate < 0) throw new TypeError('rate must be a non-negative number');
    if (typeof periods !== 'number' || periods < 0) throw new TypeError('periods must be a non-negative number');
    if (typeof compoundingFrequency !== 'number' || compoundingFrequency <= 0) throw new TypeError('compoundingFrequency must be a positive number');
    // Standard compound interest: P * (1 + r/n)^(n*t) - P
    // where n = compoundingFrequency, t = periods (in years).
    // The old code computed n * (t/n) = t as the exponent, collapsing
    // daily compounding to simple annual compounding and drastically
    // under-reporting returns for high-frequency compounding schedules.
    return principal * Math.pow(1 + (rate / compoundingFrequency), compoundingFrequency * periods) - principal;
  }

  calculateAPY(rate, compoundingFrequency = this.compoundingFrequency) {
    return Math.pow(1 + (rate / compoundingFrequency), compoundingFrequency) - 1;
  }

  calculateStakingReturns(stakeAmount, stakingDays, rewardRate = this.baseRewardRate) {
    if (typeof stakeAmount !== 'number' || stakeAmount <= 0) throw new TypeError('stakeAmount must be a positive number');
    if (typeof stakingDays !== 'number' || stakingDays <= 0) throw new TypeError('stakingDays must be a positive number');
    if (typeof rewardRate !== 'number' || rewardRate <= 0) throw new TypeError('rewardRate must be a positive number');
    const periods = stakingDays / 365; // Convert days to years
    
    const simpleYield = this.calculateSimpleYield(stakeAmount, rewardRate, periods);
    const compoundYield = this.calculateCompoundYield(stakeAmount, rewardRate, periods);
    const apy = this.calculateAPY(rewardRate);

    return {
      stakeAmount,
      stakingDays,
      rewardRate,
      simpleYield,
      compoundYield,
      apy,
      totalSimple: stakeAmount + simpleYield,
      totalCompound: stakeAmount + compoundYield,
      dailyReward: (compoundYield / stakingDays) || 0
    };
  }

  calculateBreakEven(stakeAmount, gasCosts, rewardRate = this.baseRewardRate) {
    if (typeof stakeAmount !== 'number' || stakeAmount <= 0) throw new TypeError('stakeAmount must be a positive number');
    if (typeof gasCosts !== 'number' || gasCosts < 0) throw new TypeError('gasCosts must be a non-negative number');
    if (typeof rewardRate !== 'number' || rewardRate <= 0) throw new TypeError('rewardRate must be a positive number');
    const dailyReward = (stakeAmount * rewardRate) / 365;
    const breakEvenDays = gasCosts / dailyReward;
    
    return {
      stakeAmount,
      gasCosts,
      dailyReward,
      breakEvenDays,
      breakEvenWeeks: breakEvenDays / 7,
      breakEvenMonths: breakEvenDays / 30
    };
  }

  calculateOptimalStakingPeriod(stakeAmount, targetReturn, rewardRate = this.baseRewardRate) {
    if (typeof stakeAmount !== 'number' || stakeAmount <= 0) throw new TypeError('stakeAmount must be a positive number');
    if (typeof targetReturn !== 'number') throw new TypeError('targetReturn must be a number');
    if (targetReturn <= stakeAmount) throw new Error('targetReturn must be greater than stakeAmount to produce a positive yield');
    if (typeof rewardRate !== 'number' || rewardRate <= 0) throw new TypeError('rewardRate must be a positive number');
    const targetYield = targetReturn - stakeAmount;
    const periods = targetYield / (stakeAmount * rewardRate);
    const days = periods * 365;

    return {
      stakeAmount,
      targetReturn,
      targetYield,
      optimalDays: days,
      optimalWeeks: days / 7,
      optimalMonths: days / 30,
      optimalYears: days / 365
    };
  }

  compareStakingOptions(stakeAmount, options) {
    if (typeof stakeAmount !== 'number' || stakeAmount <= 0) throw new TypeError('stakeAmount must be a positive number');
    if (!Array.isArray(options) || options.length === 0) throw new TypeError('options must be a non-empty array');
    return options.map(option => ({
      name: option.name,
      rewardRate: option.rewardRate,
      lockPeriod: option.lockPeriod,
      ...this.calculateStakingReturns(stakeAmount, option.lockPeriod, option.rewardRate)
    })).sort((a, b) => b.compoundYield - a.compoundYield);
  }

  calculateRiskAdjustedReturn(stakeAmount, rewardRate, riskFactor = 1) {
    if (typeof riskFactor !== 'number' || riskFactor <= 0) throw new TypeError('riskFactor must be a positive number');
    const baseReturn = this.calculateStakingReturns(stakeAmount, 365, rewardRate);
    const adjustedRate = rewardRate / riskFactor;
    const adjustedReturn = this.calculateStakingReturns(stakeAmount, 365, adjustedRate);

    return {
      baseReturn,
      adjustedReturn,
      riskFactor,
      riskPremium: baseReturn.compoundYield - adjustedReturn.compoundYield
    };
  }

  generateYieldProjection(stakeAmount, rewardRate, maxDays = 365) {
    const projection = [];
    
    for (let day = 1; day <= maxDays; day += 30) { // Monthly intervals
      const returns = this.calculateStakingReturns(stakeAmount, day, rewardRate);
      projection.push({
        day,
        month: Math.ceil(day / 30),
        totalValue: returns.totalCompound,
        yield: returns.compoundYield,
        apy: returns.apy
      });
    }

    return projection;
  }

  getRecommendation(stakeAmount, riskTolerance = 'medium') {
    const options = {
      low: { rate: 0.005, period: 30, description: 'Conservative staking' },
      medium: { rate: 0.01, period: 90, description: 'Balanced staking' },
      high: { rate: 0.02, period: 365, description: 'High-yield staking' }
    };

    const selected = options[riskTolerance] || options.medium;
    const returns = this.calculateStakingReturns(stakeAmount, selected.period, selected.rate);

    return {
      recommendation: selected.description,
      riskLevel: riskTolerance,
      ...returns
    };
  }
}

module.exports = { YieldCalculator };