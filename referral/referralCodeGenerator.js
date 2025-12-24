// Referral Code Generator
class ReferralCodeGenerator {
  constructor() {
    this.usedCodes = new Set();
    this.codeLength = 8;
    this.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  }

  generateCode(userAddress) {
    // Use last 8 characters of address as base
    const baseCode = userAddress.slice(-this.codeLength).toUpperCase();
    
    // If code is already used, generate a random one
    if (this.usedCodes.has(baseCode)) {
      return this.generateRandomCode();
    }

    this.usedCodes.add(baseCode);
    return baseCode;
  }

  generateRandomCode() {
    let code;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      code = '';
      for (let i = 0; i < this.codeLength; i++) {
        code += this.characters.charAt(Math.floor(Math.random() * this.characters.length));
      }
      attempts++;
    } while (this.usedCodes.has(code) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error('Unable to generate unique referral code');
    }

    this.usedCodes.add(code);
    return code;
  }

  generateCustomCode(prefix, userAddress) {
    const suffix = userAddress.slice(-4).toUpperCase();
    const code = `${prefix.toUpperCase()}${suffix}`;
    
    if (this.usedCodes.has(code)) {
      return this.generateRandomCode();
    }

    this.usedCodes.add(code);
    return code;
  }

  validateCode(code) {
    return /^[A-Z0-9]{8}$/.test(code);
  }

  isCodeAvailable(code) {
    return !this.usedCodes.has(code.toUpperCase());
  }

  reserveCode(code) {
    const upperCode = code.toUpperCase();
    if (this.usedCodes.has(upperCode)) {
      return false;
    }
    
    this.usedCodes.add(upperCode);
    return true;
  }

  generateBatch(count = 100) {
    const codes = [];
    
    for (let i = 0; i < count; i++) {
      try {
        codes.push(this.generateRandomCode());
      } catch (error) {
        break; // Stop if we can't generate more unique codes
      }
    }

    return codes;
  }

  getStats() {
    return {
      totalCodes: this.usedCodes.size,
      codeLength: this.codeLength,
      characters: this.characters.length,
      maxPossible: Math.pow(this.characters.length, this.codeLength)
    };
  }

  generateQRCode(code, baseUrl = 'https://renvault.com/ref/') {
    return {
      code,
      url: `${baseUrl}${code}`,
      qrData: `${baseUrl}${code}`,
      shareText: `Join RenVault with my referral code: ${code}`
    };
  }

  generateShareLinks(code) {
    const baseUrl = 'https://renvault.com/ref/';
    const referralUrl = `${baseUrl}${code}`;
    const message = `Join RenVault and earn rewards! Use my referral code: ${code}`;

    return {
      referralUrl,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(message)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${message} ${referralUrl}`)}`,
      email: `mailto:?subject=Join RenVault&body=${encodeURIComponent(`${message} ${referralUrl}`)}`
    };
  }
}

module.exports = { ReferralCodeGenerator };