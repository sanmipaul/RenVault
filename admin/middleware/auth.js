const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');

const ADMIN_CREDENTIALS = {
  username: config.adminUsername,
  passwordHash: bcrypt.hashSync(config.adminPassword, 10)
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
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
  return jwt.sign({ username }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

module.exports = {
  authenticateToken,
  validateCredentials,
  generateToken
};
