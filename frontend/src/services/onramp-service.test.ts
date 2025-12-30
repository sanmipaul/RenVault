import { OnRampService } from './onramp-service';

describe('OnRampService (basic)', () => {
  it('should instantiate singleton', () => {
    const s1 = OnRampService.getInstance();
    const s2 = OnRampService.getInstance();
    expect(s1).toBe(s2);
  });
});
