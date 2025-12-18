const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'renvault-admin-secret';
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USER || 'admin',
  passwordHash: bcrypt.hashSync(process.env.ADMIN_PASS || 'renvault2024', 10)
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const validateCredentials = (username, password) => {
  return username === ADMIN_CREDENTIALS.username && 
         bcrypt.compareSync(password, ADMIN_CREDENTIALS.passwordHash);
};

const generateToken = (username) => {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
};

module.exports = {
  authenticateToken,
  validateCredentials,
  generateToken
};