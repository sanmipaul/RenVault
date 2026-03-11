const { PriceAggregator } = require('./priceAggregator');

describe('PriceAggregator.fetchPrice', () => {
  let aggregator;

  beforeEach(() => {
    aggregator = new PriceAggregator();
  });

  test('fetches from all active sources and returns weighted average', async () => {
    aggregator.addSource('s1', async () => 100, 1);
    aggregator.addSource('s2', async () => 200, 1);

    const result = await aggregator.fetchPrice('STX');
    expect(result.price).toBeCloseTo(150);
    expect(result.sources).toBe(2);
  });

  test('throws when no sources are registered', async () => {
    await expect(aggregator.fetchPrice('STX')).rejects.toThrow('No price sources available');
  });

  test('skips inactive sources', async () => {
    aggregator.addSource('active', async () => 50, 1);
    aggregator.addSource('inactive', async () => 9999, 1);
    aggregator.sources.get('inactive').active = false;

    const result = await aggregator.fetchPrice('STX');
    expect(result.price).toBeCloseTo(50);
    expect(result.sources).toBe(1);
  });

  test('continues with remaining sources when one source fails', async () => {
    aggregator.addSource('good', async () => 80, 1);
    aggregator.addSource('bad', async () => { throw new Error('timeout'); }, 1);

    const result = await aggregator.fetchPrice('STX');
    expect(result.price).toBeCloseTo(80);
    expect(result.sources).toBe(1);
  });

  test('fetches all sources concurrently (not sequentially)', async () => {
    const callOrder = [];

    // Both sources start simultaneously; stagger their resolution order to
    // confirm that we do not await the first before starting the second.
    aggregator.addSource('slow', () => new Promise(resolve => {
      setTimeout(() => { callOrder.push('slow'); resolve(100); }, 30);
    }), 1);
    aggregator.addSource('fast', () => new Promise(resolve => {
      setTimeout(() => { callOrder.push('fast'); resolve(200); }, 5);
    }), 1);

    await aggregator.fetchPrice('STX');
    // With concurrent dispatch 'fast' resolves before 'slow'
    expect(callOrder).toEqual(['fast', 'slow']);
  });
});

describe('PriceAggregator.updatePrices', () => {
  let aggregator;

  beforeEach(() => {
    aggregator = new PriceAggregator();
    aggregator.addSource('s1', async (sym) => (sym === 'BTC' ? 45000 : 0.5), 1);
  });

  test('updates multiple symbols and returns them all', async () => {
    const updates = await aggregator.updatePrices(['STX', 'BTC']);
    expect(Object.keys(updates)).toHaveLength(2);
    expect(updates.BTC.price).toBeCloseTo(45000);
    expect(updates.STX.price).toBeCloseTo(0.5);
  });

  test('caches results so getPrice returns the latest data', async () => {
    await aggregator.updatePrices(['STX']);
    const cached = aggregator.getPrice('STX');
    expect(cached).toBeDefined();
    expect(cached.price).toBeCloseTo(0.5);
  });
});
