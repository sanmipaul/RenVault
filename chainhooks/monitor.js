const RenVaultChainhooksClient = require('./client');

class ChainhooksMonitor {
  constructor() {
    this.client = new RenVaultChainhooksClient();
    this.isRunning = false;
  }

  async start() {
    console.log('🚀 Starting RenVault Chainhooks Monitor...');
    
    try {
      // Create hooks for contract events
      await this.client.createDepositHook();
      await this.client.createWithdrawHook();
      
      // List active hooks
      const hooks = await this.client.listHooks();
      console.log(`📋 Monitoring ${hooks.length} hooks`);
      
      this.isRunning = true;
      console.log('✅ Chainhooks monitor started successfully');
      
    } catch (error) {
      console.error('❌ Failed to start monitor:', error);
      throw error;
    }
  }

  async stop() {
    console.log('⏹️ Stopping Chainhooks Monitor...');
    
    try {
      // Clean up hooks
      await this.client.deleteHook('renvault-deposits');
      await this.client.deleteHook('renvault-withdrawals');
      
      this.isRunning = false;
      console.log('✅ Monitor stopped');
      
    } catch (error) {
      console.error('❌ Error stopping monitor:', error);
    }
  }

  async status() {
    try {
      const hooks = await this.client.listHooks();
      return {
        running: this.isRunning,
        hooks: hooks.length,
        activeHooks: hooks.map(h => ({ uuid: h.uuid, name: h.name }))
      };
    } catch (error) {
      return { running: false, error: error.message };
    }
  }
}

// CLI usage
if (require.main === module) {
  const monitor = new ChainhooksMonitor();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'start':
      monitor.start().catch(console.error);
      break;
    case 'stop':
      monitor.stop().catch(console.error);
      break;
    case 'status':
      monitor.status().then(console.log).catch(console.error);
      break;
    default:
      console.log('Usage: node monitor.js [start|stop|status]');
  }
}

module.exports = ChainhooksMonitor;