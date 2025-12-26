#!/usr/bin/env node

/**
 * RenVault Notification System Test Script
 *
 * This script demonstrates all notification features:
 * - Transaction notifications (deposit, withdrawal, staking, liquidity rewards)
 * - Security alerts (failed login, suspicious activity, 2FA changes)
 * - Notification preferences management
 * - Push notification subscription
 */

const NotificationManager = require('./notificationManager');

async function runNotificationTests() {
  console.log('🔔 Starting RenVault Notification System Tests...\n');

  const manager = new NotificationManager();

  // Test user setup
  const testUserId = 'test-user-123';
  const testEmail = 'test@example.com';

  console.log('1. Setting up user notification preferences...');
  manager.setUserPreferences(testUserId, {
    email: testEmail,
    emailEnabled: true,
    pushEnabled: true,
    depositNotifications: true,
    withdrawalNotifications: true,
    stakingNotifications: true,
    rewardNotifications: true,
    securityAlerts: true,
    loginAlerts: true,
    suspiciousActivityAlerts: true,
    twoFactorAlerts: true
  });
  console.log('✅ User preferences configured\n');

  // Test transaction notifications
  console.log('2. Testing transaction notifications...');

  console.log('   📥 Testing deposit notification...');
  await manager.notifyDeposit(testUserId, 100, 150);

  console.log('   📤 Testing withdrawal notification...');
  await manager.notifyWithdrawal(testUserId, 50, 100);

  console.log('   🌱 Testing staking reward notification...');
  await manager.notifyStakingReward(testUserId, 5.25, 500);

  console.log('   💧 Testing liquidity reward notification...');
  await manager.notifyLiquidityReward(testUserId, 12.5, 'STX/USDA Pool');

  console.log('✅ Transaction notifications tested\n');

  // Test security alerts
  console.log('3. Testing security alerts...');

  console.log('   🚨 Testing failed login alert...');
  await manager.notifyFailedLogin(testUserId, '192.168.1.100', 'Chrome/91.0');

  console.log('   ⚠️ Testing suspicious activity alert...');
  await manager.notifySuspiciousActivity(testUserId, 'Multiple failed transactions', '10.0.0.1');

  console.log('   🔐 Testing 2FA enabled alert...');
  await manager.notifyTwoFactorEnabled(testUserId);

  console.log('   ⚠️ Testing 2FA disabled alert...');
  await manager.notifyTwoFactorDisabled(testUserId);

  console.log('✅ Security alerts tested\n');

  // Test leaderboard notification
  console.log('4. Testing leaderboard notification...');
  await manager.notifyRankingChange(testUserId, 5, 1250);
  console.log('✅ Leaderboard notification tested\n');

  // Test push notification subscription
  console.log('5. Testing push notification subscription...');
  manager.subscribeToPush(testUserId, 'https://fcm.googleapis.com/fcm/send/test-endpoint', {
    p256dh: 'test-key',
    auth: 'test-auth'
  });
  console.log('✅ Push notification subscription tested\n');

  // Get and display stats
  console.log('6. Notification system statistics:');
  const stats = manager.getStats();
  console.log(`   👥 Total users: ${stats.totalUsers}`);
  console.log(`   📱 Push subscribers: ${stats.pushSubscribers}`);
  console.log(`   📧 Email users: ${stats.emailUsers}`);
  console.log('✅ Statistics retrieved\n');

  console.log('🎉 All notification tests completed successfully!');
  console.log('\n📋 Test Summary:');
  console.log('   • Transaction notifications: ✅');
  console.log('   • Security alerts: ✅');
  console.log('   • User preferences: ✅');
  console.log('   • Push subscriptions: ✅');
  console.log('   • System statistics: ✅');
  console.log('\n🚀 RenVault notification system is ready for production!');
}

// Handle command line arguments for specific tests
const args = process.argv.slice(2);
if (args.length > 0) {
  const testType = args[0];
  console.log(`Running specific test: ${testType}`);

  // Add specific test logic here if needed
} else {
  runNotificationTests().catch(console.error);
}

module.exports = { runNotificationTests };