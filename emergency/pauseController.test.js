const { PauseController } = require('./pauseController');

describe('PauseController', () => {
  let pc;

  beforeEach(() => {
    pc = new PauseController();
  });

  describe('addEmergencyContact', () => {
    test('adds a valid contact', () => {
      pc.addEmergencyContact('addr1');
      expect(pc.isEmergencyContact('addr1')).toBe(true);
    });

    test('throws if address is empty', () => {
      expect(() => pc.addEmergencyContact('')).toThrow('address is required');
    });

    test('throws if address is not a string', () => {
      expect(() => pc.addEmergencyContact(123)).toThrow();
    });
  });

  describe('removeEmergencyContact', () => {
    test('removes a contact', () => {
      pc.addEmergencyContact('addr1');
      pc.removeEmergencyContact('addr1');
      expect(pc.isEmergencyContact('addr1')).toBe(false);
    });
  });

  describe('emergencyPause', () => {
    test('pauses protocol for authorized contact', () => {
      pc.addEmergencyContact('admin');
      const result = pc.emergencyPause('Exploit detected', 'admin');
      expect(result.success).toBe(true);
      expect(pc.getPauseStatus().isPaused).toBe(true);
    });

    test('throws for unauthorized actor', () => {
      expect(() => pc.emergencyPause('reason', 'nobody')).toThrow('Unauthorized');
    });

    test('throws if already paused', () => {
      pc.addEmergencyContact('admin');
      pc.emergencyPause('reason', 'admin');
      expect(() => pc.emergencyPause('reason2', 'admin')).toThrow('Protocol already paused');
    });
  });

  describe('resumeOperations', () => {
    test('resumes a paused protocol', () => {
      pc.addEmergencyContact('admin');
      pc.emergencyPause('reason', 'admin');
      const result = pc.resumeOperations('admin');
      expect(result.success).toBe(true);
      expect(pc.getPauseStatus().isPaused).toBe(false);
    });

    test('throws for unauthorized actor', () => {
      pc.addEmergencyContact('admin');
      pc.emergencyPause('reason', 'admin');
      expect(() => pc.resumeOperations('nobody')).toThrow('Unauthorized');
    });

    test('throws if not paused', () => {
      pc.addEmergencyContact('admin');
      expect(() => pc.resumeOperations('admin')).toThrow('Protocol not paused');
    });
  });

  describe('getPauseStatus', () => {
    test('returns isPaused false when not paused', () => {
      expect(pc.getPauseStatus().isPaused).toBe(false);
    });

    test('returns duration > 0 while paused', async () => {
      pc.addEmergencyContact('admin');
      pc.emergencyPause('test', 'admin');
      await new Promise(r => setTimeout(r, 5));
      expect(pc.getPauseStatus().duration).toBeGreaterThan(0);
    });
  });

  describe('checkAndPause (auto-pause)', () => {
    test('does not throw and returns an object', () => {
      expect(() => pc.checkAndPause()).not.toThrow();
      expect(pc.checkAndPause()).toBeDefined();
    });

    test('returns alreadyPaused if already paused', () => {
      pc.addEmergencyContact('admin');
      pc.emergencyPause('reason', 'admin');
      expect(pc.checkAndPause()).toEqual({ alreadyPaused: true });
    });
  });
});
