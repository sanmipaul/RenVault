const { TreasuryManager } = require('./treasuryManager');

describe('TreasuryManager', () => {
  let tm;

  beforeEach(() => {
    tm = new TreasuryManager();
  });

  describe('deposit', () => {
    test('increases balance', () => {
      tm.deposit(1000);
      expect(tm.getBalance()).toBe(1000);
    });

    test('accumulates multiple deposits', () => {
      tm.deposit(500);
      tm.deposit(300);
      expect(tm.getBalance()).toBe(800);
    });

    test('throws if amount is not positive', () => {
      expect(() => tm.deposit(0)).toThrow('deposit amount must be a positive number');
      expect(() => tm.deposit(-100)).toThrow();
    });
  });

  describe('withdraw', () => {
    test('decreases balance', () => {
      tm.deposit(1000);
      tm.withdraw(400, 'addr1', 'grant');
      expect(tm.getBalance()).toBe(600);
    });

    test('throws if insufficient funds', () => {
      tm.deposit(100);
      expect(() => tm.withdraw(200, 'addr1', 'grant')).toThrow('Insufficient treasury funds');
    });

    test('throws if amount is not positive', () => {
      tm.deposit(1000);
      expect(() => tm.withdraw(0, 'addr1', 'grant')).toThrow('withdrawal amount must be a positive number');
      expect(() => tm.withdraw(-50, 'addr1', 'grant')).toThrow();
    });

    test('throws if recipient is missing', () => {
      tm.deposit(1000);
      expect(() => tm.withdraw(100, '', 'grant')).toThrow('recipient is required');
    });
  });

  describe('createBudget', () => {
    test('creates a budget', () => {
      tm.createBudget('dev', 5000);
      expect(tm.budgets.has('dev')).toBe(true);
    });

    test('throws if category is missing', () => {
      expect(() => tm.createBudget('', 5000)).toThrow('category is required');
    });

    test('throws if amount is not positive', () => {
      expect(() => tm.createBudget('dev', 0)).toThrow('budget amount must be a positive number');
    });
  });

  describe('spendFromBudget', () => {
    test('deducts from budget and treasury', () => {
      tm.deposit(5000);
      tm.createBudget('dev', 1000);
      tm.spendFromBudget('dev', 400, 'salaries');
      expect(tm.budgets.get('dev').spent).toBe(400);
      expect(tm.getBalance()).toBe(4600);
    });

    test('throws if budget exceeded', () => {
      tm.deposit(5000);
      tm.createBudget('dev', 100);
      expect(() => tm.spendFromBudget('dev', 200, 'too much')).toThrow('Budget exceeded');
    });
  });

  describe('getBudgetStatus', () => {
    test('shows correct utilization', () => {
      tm.deposit(5000);
      tm.createBudget('marketing', 1000);
      tm.spendFromBudget('marketing', 250, 'ads');
      const status = tm.getBudgetStatus();
      expect(status.marketing.utilization).toBe('25.0');
    });

    test('does not divide by zero when allocated is 0', () => {
      // Directly inject a zero-allocated budget to test guard
      tm.budgets.set('zero', { allocated: 0, spent: 0, period: 'monthly', createdAt: Date.now() });
      expect(() => tm.getBudgetStatus()).not.toThrow();
      expect(tm.getBudgetStatus().zero.utilization).toBe('0.0');
    });
  });

  describe('getTreasuryStats', () => {
    test('returns correct totals', () => {
      tm.deposit(1000);
      tm.deposit(500);
      tm.withdraw(200, 'addr1', 'grant');
      const stats = tm.getTreasuryStats();
      expect(stats.totalDeposits).toBe(1500);
      expect(stats.totalWithdrawals).toBe(200);
      expect(stats.currentBalance).toBe(1300);
    });
  });
});
