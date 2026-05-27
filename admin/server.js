const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('./config');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const ADMIN_USER = config.adminUsername;
const ADMIN_PASS_HASH = bcrypt.hashSync(config.adminPassword, 10);
const JWT_SECRET = config.jwtSecret;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && bcrypt.compareSync(password, ADMIN_PASS_HASH)) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: config.jwtExpiresIn });
    res.json({ token, message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/admin/status', authenticateToken, (req, res) => {
  res.json({
    system: 'operational',
    services: {
      frontend: 'running',
      mobile: 'running',
      monitoring: 'running',
      leaderboard: 'running',
      notifications: 'running',
      backup: 'running'
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/admin/metrics', authenticateToken, async (req, res) => {
  try {
    const metrics = {
      totalUsers: 1250,
      totalDeposits: 50000,
      totalFees: 500,
      activeUsers24h: 89,
      avgBalance: 40.5,
      topUser: 'SP1ABC...XYZ'
    };
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/services/:service/restart', authenticateToken, (req, res) => {
  const { service } = req.params;
  console.log(`Restarting service: ${service}`);

  setTimeout(() => {
    io.emit('serviceRestarted', { service, timestamp: new Date() });
  }, 2000);

  res.json({ message: `Restarting ${service}...` });
});

io.on('connection', (socket) => {
  console.log('Admin connected');

  const interval = setInterval(() => {
    socket.emit('metricsUpdate', {
      activeUsers: Math.floor(Math.random() * 100) + 50,
      newDeposits: Math.floor(Math.random() * 10),
      timestamp: new Date()
    });
  }, 5000);

  socket.on('disconnect', () => {
    clearInterval(interval);
    console.log('Admin disconnected');
  });
});

server.listen(config.port, config.host, () => {
  console.log(`Admin dashboard running on ${config.host}:${config.port}`);
});

module.exports = app;
