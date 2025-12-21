// Bridge Validator Network
class ValidatorNetwork {
  constructor() {
    this.validators = new Map();
    this.requiredSignatures = 3;
    this.validatorStake = 1000000; // 1M STX minimum stake
  }

  registerValidator(address, stake, publicKey) {
    if (stake < this.validatorStake) {
      throw new Error('Insufficient stake');
    }

    this.validators.set(address, {
      address,
      stake,
      publicKey,
      active: true,
      reputation: 100
    });

    return true;
  }

  validateBridgeTransaction(txId, signatures) {
    if (signatures.length < this.requiredSignatures) {
      return { valid: false, reason: 'Insufficient signatures' };
    }

    const validSignatures = signatures.filter(sig => 
      this.validators.has(sig.validator) && 
      this.validators.get(sig.validator).active
    );

    if (validSignatures.length < this.requiredSignatures) {
      return { valid: false, reason: 'Invalid validators' };
    }

    return { valid: true, validators: validSignatures.map(s => s.validator) };
  }

  slashValidator(address, amount) {
    const validator = this.validators.get(address);
    if (!validator) return false;

    validator.stake -= amount;
    validator.reputation = Math.max(0, validator.reputation - 10);

    if (validator.stake < this.validatorStake) {
      validator.active = false;
    }

    return true;
  }

  getActiveValidators() {
    return Array.from(this.validators.values()).filter(v => v.active);
  }

  getValidatorInfo(address) {
    return this.validators.get(address);
  }
}

module.exports = { ValidatorNetwork };