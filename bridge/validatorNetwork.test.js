const { ValidatorNetwork } = require('./validatorNetwork');

describe('ValidatorNetwork', () => {
  let vn;
  const MIN_STAKE = 1000000;

  beforeEach(() => {
    vn = new ValidatorNetwork();
  });

  describe('registerValidator', () => {
    test('registers a valid validator', () => {
      expect(vn.registerValidator('addr1', MIN_STAKE, 'pubkey1')).toBe(true);
      expect(vn.getValidatorInfo('addr1')).toBeDefined();
    });

    test('throws if stake is insufficient', () => {
      expect(() => vn.registerValidator('addr1', MIN_STAKE - 1, 'pk')).toThrow('Insufficient stake');
    });

    test('throws if address is missing', () => {
      expect(() => vn.registerValidator('', MIN_STAKE, 'pk')).toThrow('address is required');
    });

    test('throws if publicKey is missing', () => {
      expect(() => vn.registerValidator('addr1', MIN_STAKE, '')).toThrow('publicKey is required');
    });

    test('sets validator as active with reputation 100', () => {
      vn.registerValidator('addr1', MIN_STAKE, 'pk1');
      const v = vn.getValidatorInfo('addr1');
      expect(v.active).toBe(true);
      expect(v.reputation).toBe(100);
    });
  });

  describe('validateBridgeTransaction', () => {
    beforeEach(() => {
      vn.registerValidator('v1', MIN_STAKE, 'pk1');
      vn.registerValidator('v2', MIN_STAKE, 'pk2');
      vn.registerValidator('v3', MIN_STAKE, 'pk3');
    });

    test('returns valid for sufficient valid signatures', () => {
      const sigs = [
        { validator: 'v1', sig: 'a' },
        { validator: 'v2', sig: 'b' },
        { validator: 'v3', sig: 'c' }
      ];
      expect(vn.validateBridgeTransaction('tx1', sigs).valid).toBe(true);
    });

    test('returns invalid for insufficient signatures', () => {
      expect(vn.validateBridgeTransaction('tx1', [{ validator: 'v1', sig: 'a' }]).valid).toBe(false);
    });

    test('returns invalid if validators not registered', () => {
      const sigs = [
        { validator: 'unknown1', sig: 'a' },
        { validator: 'unknown2', sig: 'b' },
        { validator: 'unknown3', sig: 'c' }
      ];
      expect(vn.validateBridgeTransaction('tx1', sigs).valid).toBe(false);
    });
  });

  describe('slashValidator', () => {
    test('reduces stake and reputation', () => {
      vn.registerValidator('addr1', MIN_STAKE + 500000, 'pk1');
      vn.slashValidator('addr1', 100000);
      const v = vn.getValidatorInfo('addr1');
      expect(v.stake).toBe(MIN_STAKE + 400000);
      expect(v.reputation).toBe(90);
    });

    test('deactivates validator when stake falls below minimum', () => {
      vn.registerValidator('addr1', MIN_STAKE, 'pk1');
      vn.slashValidator('addr1', 1);
      expect(vn.getValidatorInfo('addr1').active).toBe(false);
    });

    test('throws if slash amount is zero or negative', () => {
      vn.registerValidator('addr1', MIN_STAKE, 'pk1');
      expect(() => vn.slashValidator('addr1', 0)).toThrow('slash amount must be a positive number');
      expect(() => vn.slashValidator('addr1', -100)).toThrow();
    });

    test('returns false for unknown validator', () => {
      expect(vn.slashValidator('nobody', 100)).toBe(false);
    });
  });

  describe('getActiveValidators', () => {
    test('returns only active validators', () => {
      vn.registerValidator('a1', MIN_STAKE, 'pk1');
      vn.registerValidator('a2', MIN_STAKE, 'pk2');
      vn.slashValidator('a1', MIN_STAKE); // deactivates
      expect(vn.getActiveValidators()).toHaveLength(1);
      expect(vn.getActiveValidators()[0].address).toBe('a2');
    });
  });
});
