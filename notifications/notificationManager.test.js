const NotificationManager = require('./notificationManager');

// Stub out the services so no real email/push calls are made
jest.mock('./emailService', () => {
  return jest.fn().mockImplementation(() => ({
    sendDepositAlert: jest.fn().mockResolvedValue(true),
    sendWithdrawAlert: jest.fn().mockResolvedValue(true),
    sendLeaderboardUpdate: jest.fn().mockResolvedValue(true),
    sendStakingRewardAlert: jest.fn().mockResolvedValue(true),
  }));
});

jest.mock('./pushService', () => {
  return jest.fn().mockImplementation(() => ({
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    getSubscriberCount: jest.fn().mockReturnValue(0),
    sendDepositNotification: jest.fn().mockResolvedValue(true),
    sendWithdrawNotification: jest.fn().mockResolvedValue(true),
    sendRankingNotification: jest.fn().mockResolvedValue(true),
    sendStakingRewardNotification: jest.fn().mockResolvedValue(true),
  }));
});

jest.mock('./logger', () => {
  return jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }));
});

function makeManager() {
  return new NotificationManager();
}

function setPrefs(manager, userId, overrides = {}) {
  manager.setUserPreferences(userId, {
    email: 'user@example.com',
    emailEnabled: true,
    pushEnabled: true,
    ...overrides,
  });
}

describe('NotificationManager — deposit preference', () => {
  test('sends deposit notification when depositNotifications is enabled (default)', async () => {
    const manager = makeManager();
    setPrefs(manager, 'u1');

    const spy = jest.spyOn(manager, '_sendNotification');
    await manager.notifyDeposit('u1', 100, 500);

    expect(spy).toHaveBeenCalledWith(
      'u1',
      'sendDepositAlert', [100, 500],
      'sendDepositNotification', [100],
      NotificationManager.PRIORITIES.MEDIUM,
      'depositNotifications'
    );
  });

  test('suppresses deposit notification when depositNotifications is false', async () => {
    const manager = makeManager();
    setPrefs(manager, 'u1', { depositNotifications: false });

    const emailSpy = jest.spyOn(manager.emailService, 'sendDepositAlert');
    await manager.notifyDeposit('u1', 100, 500);

    expect(emailSpy).not.toHaveBeenCalled();
  });
});

describe('NotificationManager — withdrawal preference', () => {
  test('sends withdrawal notification when withdrawalNotifications is enabled (default)', async () => {
    const manager = makeManager();
    setPrefs(manager, 'u1');

    const spy = jest.spyOn(manager, '_sendNotification');
    await manager.notifyWithdrawal('u1', 50, 450);

    expect(spy).toHaveBeenCalledWith(
      'u1',
      'sendWithdrawAlert', [50, 450],
      'sendWithdrawNotification', [50],
      NotificationManager.PRIORITIES.MEDIUM,
      'withdrawalNotifications'
    );
  });

  test('suppresses withdrawal notification when withdrawalNotifications is false', async () => {
    const manager = makeManager();
    setPrefs(manager, 'u1', { withdrawalNotifications: false });

    const emailSpy = jest.spyOn(manager.emailService, 'sendWithdrawAlert');
    await manager.notifyWithdrawal('u1', 50, 450);

    expect(emailSpy).not.toHaveBeenCalled();
  });
});

describe('NotificationManager — leaderboard preference', () => {
  test('sends ranking notification when leaderboardNotifications is enabled (default)', async () => {
    const manager = makeManager();
    setPrefs(manager, 'u1');

    const spy = jest.spyOn(manager, '_sendNotification');
    await manager.notifyRankingChange('u1', 5, 1200);

    expect(spy).toHaveBeenCalledWith(
      'u1',
      'sendLeaderboardUpdate', [5, 1200],
      'sendRankingNotification', [5],
      NotificationManager.PRIORITIES.LOW,
      'leaderboardNotifications'
    );
  });

  test('suppresses ranking notification when leaderboardNotifications is false', async () => {
    const manager = makeManager();
    setPrefs(manager, 'u1', { leaderboardNotifications: false });

    const emailSpy = jest.spyOn(manager.emailService, 'sendLeaderboardUpdate');
    await manager.notifyRankingChange('u1', 5, 1200);

    expect(emailSpy).not.toHaveBeenCalled();
  });
});
