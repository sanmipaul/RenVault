const { getProtocolMetrics } = require('./metrics');
const MetricsLogger = require('./logger');
const AlertSystem = require('./alerts');

class ProtocolMonitor {
  constructor() {
    this.logger = new MetricsLogger();
    this.alerts = new AlertSystem();
    this.isRunning = false;
  }

  async start(intervalMs = 60000) {
    this.isRunning = true;
    console.log('🔍 Starting RenVault protocol monitoring...');
    
    while (this.isRunning) {
      try {
        const metrics = await getProtocolMetrics();
        if (metrics) {
          this.logger.log(metrics);
          
          const alerts = this.alerts.checkMetrics(metrics);
          alerts.forEach(alert => this.alerts.sendAlert(alert));
          
          console.log(`📊 Metrics collected: ${metrics.totalFees} microSTX fees`);
        }
      } catch (error) {
        console.error('❌ Monitoring error:', error.message);
      }
      
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  stop() {
    this.isRunning = false;
    console.log('⏹️ Monitoring stopped');
  }
}

module.exports = ProtocolMonitor;