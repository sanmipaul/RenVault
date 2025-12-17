const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

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