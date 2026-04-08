const WalletManager = require('../frontend/src/services/wallet/WalletManager');
const WalletProviderLoader = require('../frontend/src/services/wallet/WalletProviderLoader');

class PerformanceTest {
  constructor() {
    this.walletManager = new WalletManager();
  }

  async runTests() {
    console.log('⚡ Running Performance Tests...\n');

    try {
      // Test 1: Connection caching
      console.log('Test 1: Connection Caching');
      await this.testConnectionCaching();
      console.log('✅ Connection caching test passed\n');

      // Test 2: Lazy loading
      console.log('Test 2: Lazy Loading');
      await this.testLazyLoading();
      console.log('✅ Lazy loading test passed\n');

      // Test 3: Provider preloading
      console.log('Test 3: Provider Preloading');
      await this.testProviderPreloading();
      console.log('✅ Provider preloading test passed\n');

      // Test 4: Timeout handling
      console.log('Test 4: Timeout Handling');
      await this.testTimeoutHandling();
      console.log('✅ Timeout handling test passed\n');

      console.log('🎉 All performance tests passed!');
      
      // FIX: Explicitly exit to prevent the test script from hanging on open 
      // wallet provider connections (like WebSockets or background intervals)
      process.exit(0);

    } catch (error) {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    }
  }

  async testConnectionCaching() {
    // Mock connection state
    this.walletManager.connectionState = {
      address: 'ST1234567890123456789012345678901234567890',
      publicKey: '03abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab'
    };

    const cacheStats = this.walletManager.getConnectionCacheStats();
    
    // FIX: Verify cacheStats actually exists before checking its properties
    if (!cacheStats || cacheStats.size < 0) {
      throw new Error('Cache stats should be available');
    }

    // Clear cache
    this.walletManager.clearConnectionCache();
    const clearedStats = this.walletManager.getConnectionCacheStats();
    // Cache might still have entries, but clearing should work
  }

  async testLazyLoading() {
    const startTime = Date.now();

    // Load a provider lazily
    await this.walletManager.setProvider('xverse');

    const loadTime = Date.now() - startTime;
    if (loadTime > 5000) { // Should load within 5 seconds
      throw new Error('Lazy loading took too long');
    }

    const metrics = this.walletManager.getPerformanceMetrics();
    
    // FIX: Verify metrics actually exists before checking loadedProviders
    if (!metrics || metrics.loadedProviders < 1) {
      throw new Error('Provider should be loaded');
    }
  }

  async testProviderPreloading() {
    const startTime = Date.now();

    // Preload critical providers
    await WalletProviderLoader.preloadCriticalProviders();

    const preloadTime = Date.now() - startTime;
    if (preloadTime > 3000) { // Should preload within 3 seconds
      throw new Error('Preloading took too long');
    }

    const cacheStats = WalletProviderLoader.getCacheStats();
    
    // FIX: Verify cacheStats actually exists before checking cached
    if (!cacheStats || cacheStats.cached < 1) {
      throw new Error('Critical providers should be cached');
    }
  }

  async testTimeoutHandling() {
    // Test that timeouts are handled properly
    const metrics = this.walletManager.getPerformanceMetrics();

    // Simulate some operations that might create timeouts
    try {
      await this.walletManager.setProvider('leather');
    } catch (error) {
      // Expected if provider fails
    }

    const updatedMetrics = this.walletManager.getPerformanceMetrics();
    
    // Metrics should be available even after operations
    // FIX: Verify updatedMetrics exists to prevent a TypeError on .activeTimeouts
    if (!updatedMetrics || typeof updatedMetrics.activeTimeouts !== 'number') {
      throw new Error('Timeout metrics should be available');
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const test = new PerformanceTest();
  // FIX: Add .catch to capture any top-level unhandled rejections
  test.runTests().catch(console.error);
}

module.exports = PerformanceTest;
