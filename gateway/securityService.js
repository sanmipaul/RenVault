// Security Service for 2FA and Authentication
const speakeasy = require('speakeasy');
const crypto = require('crypto');

class SecurityService {
  constructor() {
    this.users = new Map(); // In production, use a database
  }

  // Generate 2FA secret and QR code
  generateSecret(userId) {
    const secret = speakeasy.generateSecret({
      name: `RenVault (${userId})`,
      issuer: 'RenVault'
    });

    const qrCodeUrl = speakeasy.otpauthURL({
      secret: secret.ascii,
      label: `RenVault (${userId})`,
      issuer: 'RenVault'
    });

    this.users.set(userId, {
      secret: secret.ascii,
      backupCodes: [],
      enabled: false
    });

    return {
      secret: secret.ascii,
      qrCodeUrl
    };
  }

  // Verify 2FA code
  verifyCode(userId, code) {
    const user = this.users.get(userId);
    if (!user || !user.enabled) {
      return false;
    }

    return speakeasy.totp.verify({
      secret: user.secret,
      encoding: 'ascii',
      token: code,
      window: 2 // Allow 2 time windows (30 seconds each)
    });
  }

  // Enable 2FA after verification
  enable2FA(userId) {
    const user = this.users.get(userId);
    if (user) {
      user.enabled = true;
    }
  }

  // Generate backup codes
  generateBackupCodes(userId) {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }

    const user = this.users.get(userId);
    if (user) {
      user.backupCodes = codes;
    }

    return codes;
  }

  // Verify backup code
  verifyBackupCode(userId, code) {
    const user = this.users.get(userId);
    if (!user) return false;

    const index = user.backupCodes.indexOf(code);
    if (index > -1) {
      user.backupCodes.splice(index, 1); // Remove used code
      return true;
    }
    return false;
  }

  // Check if 2FA is enabled
  is2FAEnabled(userId) {
    const user = this.users.get(userId);
    return user && user.enabled;
  }

  // Get remaining backup codes count
  getBackupCodesCount(userId) {
    const user = this.users.get(userId);
    return user ? user.backupCodes.length : 0;
  }
}

module.exports = { SecurityService };