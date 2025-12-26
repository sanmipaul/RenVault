const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { SecurityService } = require('./securityService');

const app = express();
const securityService = new SecurityService();

// Input validation middleware
const validate2FAInput = (req, res, next) => {
  const { userId, code } = req.body;
  if (!userId || typeof userId !== 'string' || userId.length > 100) {
    return res.status(400).json({ error: 'Invalid userId' });
  }
  if (code && (typeof code !== 'string' || !/^\d{6}$/.test(code))) {
    return res.status(400).json({ error: 'Invalid 2FA code format' });
  }
  next();
};

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://relay.walletconnect.org", "https://*.walletconnect.org"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  }
}));
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Stricter rate limiting for 2FA endpoints
const tfaLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // limit each IP to 5 2FA attempts per windowMs
  message: 'Too many 2FA attempts. Please try again later.'
});

// Service routes configuration
const services = {
  monitoring: 'http://localhost:3001',
  leaderboard: 'http://localhost:3002',
  notifications: 'http://localhost:3003',
  backup: 'http://localhost:3004',
  admin: 'http://localhost:3005'
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: Object.keys(services)
  });
});

// API routes with proxy
Object.entries(services).forEach(([service, target]) => {
  app.use(`/api/${service}`, createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      [`^/api/${service}`]: '/api'
    },
    onError: (err, req, res) => {
      console.error(`Proxy error for ${service}:`, err.message);
      res.status(503).json({ error: `Service ${service} unavailable` });
    }
  }));
});

// 2FA routes
app.post('/api/2fa/generate', tfaLimiter, (req, res) => {
  try {
    const { userId } = req.body;
    const result = securityService.generateSecret(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate 2FA secret' });
  }
});

app.post('/api/2fa/verify', tfaLimiter, validate2FAInput, (req, res) => {
  try {
    const { userId, code } = req.body;
    const isValid = securityService.verifyCode(userId, code);
    if (isValid) {
      securityService.enable2FA(userId);
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid code' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.post('/api/2fa/backup-codes', (req, res) => {
  try {
    const { userId } = req.body;
    const backupCodes = securityService.generateBackupCodes(userId);
    res.json({ backupCodes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate backup codes' });
  }
});

app.post('/api/2fa/verify-backup', tfaLimiter, (req, res) => {
  try {
    const { userId, code } = req.body;
    const isValid = securityService.verifyBackupCode(userId, code);
    if (isValid) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid backup code' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Backup code verification failed' });
  }
});

app.get('/api/2fa/status/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const enabled = securityService.is2FAEnabled(userId);
    const backupCodesCount = securityService.getBackupCodesCount(userId);
    res.json({ enabled, backupCodesCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get 2FA status' });
  }
});

// Fallback for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🌐 API Gateway running on port ${PORT}`);
  console.log('Available services:', Object.keys(services).join(', '));
});

module.exports = app;