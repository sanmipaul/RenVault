const crypto = require('crypto');

const config = {
  jwtSecret: process.env.JWT_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    return 'renvault-dev-secret-change-in-production';
  })(),
  adminUsername: process.env.ADMIN_USER || 'admin',
  adminPassword: process.env.ADMIN_PASS || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ADMIN_PASS must be set in production');
    }
    return 'change-me-in-production';
  })(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  port: parseInt(process.env.ADMIN_PORT, 10) || 3005,
  host: process.env.ADMIN_HOST || 'localhost'
};

module.exports = config;
