const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IP_RE = /^(\d{1,3}\.){3}\d{1,3}$|^[0-9a-f:]+$/i;

function validateUserId(userId) {
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    return 'userId must be a non-empty string';
  }
  if (userId.length > 256) {
    return 'userId must not exceed 256 characters';
  }
  return null;
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return 'email must be a non-empty string';
  }
  if (!EMAIL_RE.test(email)) {
    return 'email format is invalid';
  }
  return null;
}

function validateAmount(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) {
    return 'amount must be a positive number';
  }
  return null;
}

function validateIpAddress(ip) {
  if (!ip || typeof ip !== 'string') {
    return 'ipAddress must be a non-empty string';
  }
  if (!IP_RE.test(ip)) {
    return 'ipAddress format is invalid';
  }
  return null;
}

function validateEndpoint(endpoint) {
  if (!endpoint || typeof endpoint !== 'string') {
    return 'endpoint must be a non-empty string';
  }
  if (!endpoint.startsWith('https://')) {
    return 'endpoint must use HTTPS';
  }
  return null;
}

module.exports = { validateUserId, validateEmail, validateAmount, validateIpAddress, validateEndpoint };
