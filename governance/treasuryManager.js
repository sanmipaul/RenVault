// Treasury Manager
class TreasuryManager {
  constructor() {
    this.balance = 0;
    this.transactions = [];
    this.budgets = new Map();
  }

  deposit(amount, source = 'protocol-fees') {
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

    budget.spent += amount;
    this.withdraw(amount, 'budget-spend', `${category}: ${description}`);
    return budget;
  }

  getBalance() {
    return this.balance;
  }

  getTransactionHistory(limit = 50) {
    return this.transactions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getBudgetStatus() {
    const budgets = {};
    for (const [category, budget] of this.budgets.entries()) {
      budgets[category] = {
        ...budget,
        remaining: budget.allocated - budget.spent,
        utilization: (budget.spent / budget.allocated * 100).toFixed(1)
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