// Treasury Manager
class TreasuryManager {
  constructor() {
    this.balance = 0;
    this.transactions = [];
    this.budgets = new Map();
  }

  _validateAmount(amount, label = 'amount') {
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      throw new Error(`${label} must be a finite positive number`);
    }
  }

  deposit(amount, source = 'protocol-fees') {
    if (typeof amount !== 'number' || amount <= 0) throw new Error('deposit amount must be a positive number');
    this.balance += amount;
    this.transactions.push({
      type: 'deposit',
      amount,
      source,
      timestamp: Date.now(),
      balance: this.balance
    });
    return this.balance;
  }

  withdraw(amount, recipient, purpose) {
    if (typeof amount !== 'number' || amount <= 0) throw new Error('withdrawal amount must be a positive number');
    if (!recipient || typeof recipient !== 'string') throw new Error('recipient is required');
    if (amount > this.balance) throw new Error('Insufficient treasury funds');
    
    this.balance -= amount;
    this.transactions.push({
      type: 'withdrawal',
      amount,
      recipient,
      purpose,
      timestamp: Date.now(),
      balance: this.balance
    });
    return this.balance;
  }

  createBudget(category, amount, period = 'monthly') {
    if (!category || typeof category !== 'string') throw new Error('category is required');
    if (typeof amount !== 'number' || amount <= 0) throw new Error('budget amount must be a positive number');
    this.budgets.set(category, {
      allocated: amount,
      spent: 0,
      period,
      createdAt: Date.now()
    });
    return true;
  }

  spendFromBudget(category, amount, description) {
    const budget = this.budgets.get(category);
    if (!budget) throw new Error('Budget category not found');
    if (budget.spent + amount > budget.allocated) throw new Error('Budget exceeded');

    // Withdraw first: if the treasury has insufficient funds withdraw() throws
    // and budget.spent is never touched, keeping both state machines consistent.
    // Mutating budget.spent before the withdraw would leave the budget showing
    // as partially spent even though no funds left the treasury.
    this.withdraw(amount, 'budget-spend', `${category}: ${description}`);
    budget.spent += amount;
    return budget;
  }

  getBalance() {
    return this.balance;
  }

  getTransactionHistory(limit = 50) {
    // Spread before sorting: Array.prototype.sort is in-place, so sorting
    // this.transactions directly permanently reorders the internal ledger.
    // Subsequent getTreasuryStats() or integrity checks would see a scrambled
    // transaction array that still sums correctly but audits in wrong order.
    return [...this.transactions]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getBudgetStatus() {
    const budgets = {};
    for (const [category, budget] of this.budgets.entries()) {
      budgets[category] = {
        ...budget,
        remaining: budget.allocated - budget.spent,
        utilization: budget.allocated > 0 ? (budget.spent / budget.allocated * 100).toFixed(1) : '0.0'
      };
    }
    return budgets;
  }

  getTreasuryStats() {
    const totalDeposits = this.transactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalWithdrawals = this.transactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      currentBalance: this.balance,
      totalDeposits,
      totalWithdrawals,
      transactionCount: this.transactions.length,
      budgetCategories: this.budgets.size
    };
  }
}

module.exports = { TreasuryManager };