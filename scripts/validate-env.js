const REQUIRED_PROD_VARS = [
  'JWT_SECRET',
  'ADMIN_PASS',
  'ORACLE_API_KEY',
  'NODE_ENV'
];

function validateEnv() {
  const missing = REQUIRED_PROD_VARS.filter(
    (v) => !process.env[v] || process.env[v] === 'change-me-in-production'
  );

  if (missing.length > 0) {
    const isProduction = process.env.NODE_ENV === 'production';
    const message = isProduction
      ? `Missing or using default values for required environment variables in production: ${missing.join(', ')}`
      : `Warning: The following environment variables use default values: ${missing.join(', ')}`;
    console.warn(message);
    return false;
  }

  console.log('Environment validation passed.');
  return true;
}

module.exports = { validateEnv };

if (require.main === module) {
  validateEnv();
}
