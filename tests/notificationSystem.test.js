const NotificationManager = require('../notifications/notificationManager');
const EmailService = require('../notifications/emailService');
const PushNotificationService = require('../notifications/pushService');

class NotificationSystemTest {
  constructor() {
    this.notificationManager = new NotificationManager();
  }

  async runTests() {
    console.log('🔔 Running Notification System Tests...\n');

    try {
      // Test 1: Transaction notifications
      console.log('Test 1: Transaction Notifications');
      await this.testTransactionNotifications();
      console.log('✅ Transaction notifications test passed\n');

      // Test 2: Security alerts
      console.log('Test 2: Security Alerts');
      await this.testSecurityAlerts();
      console.log('✅ Security alerts test passed\n');

      // Test 3: User preferences
      console.log('Test 3: User Preferences');
      await this.testUserPreferences();
      console.log('✅ User preferences test passed\n');

      // Test 4: Email service
      console.log('Test 4: Email Service');
      await this.testEmailService();
      console.log('✅ Email service test passed\n');

      console.log('🎉 All notification system tests passed!');

    } catch (error) {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    }
  }

  async testTransactionNotifications() {
    const testUserId = 'test-user-123';

    // Test deposit notification
    await this.notificationManager.notifyDeposit(testUserId, {
      amount: '100.00',
      asset: 'STX',
      txHash: '0x123456789'
    });

    // Test withdrawal notification
    await this.notificationManager.notifyWithdrawal(testUserId, {
      amount: '50.00',
      asset: 'STX',
      txHash: '0x987654321'
    });

    // Test transfer notification
    await this.notificationManager.notifyTransfer(testUserId, {
      amount: '25.00',
      asset: 'STX',
      recipient: 'SP123456789',
      txHash: '0xabcdef123'
    });
  }

  async testSecurityAlerts() {
    const testUserId = 'test-user-123';

    // Test failed login
    await this.notificationManager.notifyFailedLogin(testUserId, {
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...'
    });

    // Test two-factor enabled
    await this.notificationManager.notifyTwoFactorEnabled(testUserId);

    // Test suspicious activity
    await this.notificationManager.notifySuspiciousActivity(testUserId, {
      activity: 'Multiple failed login attempts',
      details: '5 failed attempts from IP 192.168.1.1'
    });
  }

  async testUserPreferences() {
    const testUserId = 'test-user-123';

    // Set user preferences
    const preferences = {
      email: {
        transaction: true,
        security: true,
        reward: false
      },
      push: {
        transaction: true,
        security: true,
        reward: true
      },
      sound: {
        enabled: true,
        volume: 0.8
      }
    };

    await this.notificationManager.setUserPreferences(testUserId, preferences);

    // Verify preferences were set
    const savedPreferences = await this.notificationManager.getUserPreferences(testUserId);
    if (!savedPreferences.email.transaction) {
      throw new Error('User preferences not saved correctly');
    }
  }

  async testEmailService() {
    const emailService = new EmailService();

    // Test email template loading
    const depositTemplate = emailService.loadTemplate('deposit');
    if (!depositTemplate) {
      throw new Error('Deposit email template not found');
    }

    // Test email rendering
    const renderedEmail = emailService.renderTemplate(depositTemplate, {
      userName: 'Test User',
      amount: '100.00',
      asset: 'STX',
      txHash: '0x123456789'
    });

    if (!renderedEmail.includes('100.00')) {
      throw new Error('Email template rendering failed');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const test = new NotificationSystemTest();
  test.runTests().catch(console.error);
}

module.exports = NotificationSystemTest;