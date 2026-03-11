const { TreasuryManager } = require('./treasuryManager');

// ─────────────────────────────────────────────────────────────────────────────
// deposit / withdraw — input validation
// ─────────────────────────────────────────────────────────────────────────────

describe('TreasuryManager — deposit and withdraw input validation', () => {
  let tm;

  beforeEach(() => {
    tm = new TreasuryManager();
    tm.deposit(1_000_000, 'seed');
  });

  test('deposit rejects negative amounts', () => {
    expect(() => tm.deposit(-500)).toThrow('finite positive number');
  });

  test('deposit rejects zero', () => {
    expect(() => tm.deposit(0)).toThrow('finite positive number');
  });

  test('deposit rejects NaN — balance must not become NaN', () => {
    expect(() => tm.deposit(NaN)).toThrow('finite positive number');
    expect(Number.isFinite(tm.getBalance())).toBe(true);
  });

  test('deposit rejects Infinity', () => {
    expect(() => tm.deposit(Infinity)).toThrow('finite positive number');
  });

  test('deposit rejects non-number', () => {
    expect(() => tm.deposit('1000')).toThrow('finite positive number');
  });

  test('withdraw rejects negative amounts', () => {
    expect(() => tm.withdraw(-100, 'addr1', 'test')).toThrow('finite positive number');
  });

  test('withdraw rejects missing recipient', () => {
    expect(() => tm.withdraw(100, '', 'test')).toThrow('recipient');
  });

  test('withdraw rejects non-string recipient', () => {
    expect(() => tm.withdraw(100, 42, 'test')).toThrow('recipient');
  });

  test('valid deposit increments balance correctly', () => {
    tm.deposit(500_000, 'grant');
    expect(tm.getBalance()).toBe(1_500_000);
  });

  test('valid withdraw decrements balance correctly', () => {
    tm.withdraw(200_000, 'addr1', 'dev grant');
    expect(tm.getBalance()).toBe(800_000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// spendFromBudget — atomicity
// ─────────────────────────────────────────────────────────────────────────────

describe('TreasuryManager.spendFromBudget — atomic state update', () => {
  let tm;

  beforeEach(() => {
    tm = new TreasuryManager();
    // Treasury has 500 but budget allocated 1000
    tm.deposit(500, 'seed');
    tm.createBudget('dev', 1_000, 'monthly');
  });

  test('does not corrupt budget.spent when treasury has insufficient funds', () => {
    // Budget allows 1000 but treasury only has 500
    expect(() => tm.spendFromBudget('dev', 800, 'contractor')).toThrow('Insufficient treasury funds');

    // budget.spent must still be 0 — the spend never actually happened
    const status = tm.getBudgetStatus();
    expect(status.dev.spent).toBe(0);
  });

  test('balance and budget.spent both advance on a successful spend', () => {
    tm.spendFromBudget('dev', 300, 'tooling');
    expect(tm.getBalance()).toBe(200);
    expect(tm.getBudgetStatus().dev.spent).toBe(300);
  });

  test('consecutive failed spend does not block a later valid spend', () => {
    // First attempt fails (treasury underflow)
    try { tm.spendFromBudget('dev', 800, 'fail'); } catch (_) {}
    // Second attempt should succeed (300 ≤ 500 treasury, 300 ≤ 1000 budget)
    tm.spendFromBudget('dev', 300, 'succeed');
    expect(tm.getBalance()).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getTransactionHistory — must not mutate internal ledger
// ─────────────────────────────────────────────────────────────────────────────

describe('TreasuryManager.getTransactionHistory — does not mutate this.transactions', () => {
  let tm;

  beforeEach(() => {
    tm = new TreasuryManager();
    jest.spyOn(Date, 'now')
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(2000)
      .mockReturnValueOnce(3000);
    tm.deposit(100, 'a');
    tm.deposit(200, 'b');
    tm.deposit(300, 'c');
    jest.restoreAllMocks();
  });

  test('returns transactions in descending timestamp order', () => {
    const history = tm.getTransactionHistory();
    expect(history[0].timestamp).toBeGreaterThan(history[1].timestamp);
  });

  test('calling getTransactionHistory twice yields the same order', () => {
    const first = tm.getTransactionHistory().map(t => t.timestamp);
    const second = tm.getTransactionHistory().map(t => t.timestamp);
    expect(first).toEqual(second);
  });

  test('internal transactions array retains insertion order after the call', () => {
    const before = tm.transactions.map(t => t.timestamp);
    tm.getTransactionHistory();
    expect(tm.transactions.map(t => t.timestamp)).toEqual(before);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getBudgetStatus — zero-allocation guard
// ─────────────────────────────────────────────────────────────────────────────

describe('TreasuryManager.getBudgetStatus — utilization is never NaN', () => {
  let tm;

  beforeEach(() => {
    tm = new TreasuryManager();
  });

  test('returns 0.0 utilization for a zero-allocation budget instead of NaN', () => {
    tm.createBudget('reserve', 0, 'monthly');
    const status = tm.getBudgetStatus();
    expect(status.reserve.utilization).toBe('0.0');
    expect(status.reserve.utilization).not.toBe('NaN');
  });

  test('returns correct percentage for a normal budget', () => {
    tm.deposit(1_000, 'seed');
    tm.createBudget('ops', 1_000, 'monthly');
    tm.spendFromBudget('ops', 250, 'hosting');
    expect(tm.getBudgetStatus().ops.utilization).toBe('25.0');
  });
});
