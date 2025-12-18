const axios = require('axios');

class SystemController {
  constructor() {
    this.services = {
      monitoring: 'http://localhost:3001',
      leaderboard: 'http://localhost:3002',
      notifications: 'http://localhost:3003',
      backup: 'http://localhost:3004'
    };
  }

  async getSystemHealth() {
    const health = {};
    
    for (const [service, url] of Object.entries(this.services)) {
      try {
        const response = await axios.get(`${url}/health`, { timeout: 5000 });
        health[service] = { status: 'healthy', response: response.status };
      } catch (error) {
        health[service] = { status: 'unhealthy', error: error.message };
      }
    }
    
    return health;
  }

  async getAggregatedMetrics() {
    const metrics = {
      users: { total: 0, active: 0 },
      deposits: { total: 0, today: 0 },
      fees: { collected: 0, pending: 0 },
      system: { uptime: process.uptime(), memory: process.memoryUsage() }
    };

    try {
      const monitoringResponse = await axios.get(`${this.services.monitoring}/api/metrics`);
      if (monitoringResponse.data) {
        metrics.fees.collected = monitoringResponse.data.totalFees || 0;
      }
    } catch (error) {
      console.error('Failed to fetch monitoring metrics:', error.message);
    }

    return metrics;
  }

  async restartService(serviceName) {
    console.log(`Restarting service: ${serviceName}`);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          service: serviceName, 
          status: 'restarted', 
          timestamp: new Date().toISOString() 
        });
      }, 2000);
    });
  }
}

module.exports = SystemController;