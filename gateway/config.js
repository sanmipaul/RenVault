const config = {
  port: parseInt(process.env.GATEWAY_PORT, 10) || 8080,
  host: process.env.GATEWAY_HOST || 'localhost',
  services: {
    monitoring: process.env.MONITORING_SERVICE_URL || 'http://localhost:3001',
    leaderboard: process.env.LEADERBOARD_SERVICE_URL || 'http://localhost:3002',
    notifications: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3003',
    backup: process.env.BACKUP_SERVICE_URL || 'http://localhost:3004',
    admin: process.env.ADMIN_SERVICE_URL || 'http://localhost:3005'
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100
  },
  tfaRateLimit: {
    windowMs: parseInt(process.env.TFA_RATE_LIMIT_WINDOW_MS, 10) || 5 * 60 * 1000,
    maxAttempts: parseInt(process.env.TFA_RATE_LIMIT_MAX, 10) || 5
  }
};

module.exports = config;
