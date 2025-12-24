// Referral System Startup Script
const { ReferralAPI } = require('./referralAPI');
const { ReferralCodeGenerator } = require('./referralCodeGenerator');

async function startReferral() {
  console.log('🎁 Starting RenVault Referral System...\n');

  // Initialize code generator
  const codeGenerator = new ReferralCodeGenerator();
  console.log('✅ Referral code generator initialized\n');

  // Start referral API
  const referralAPI = new ReferralAPI(3009);
  referralAPI.start();
  console.log('✅ Referral API server started on http://localhost:3009\n');

  console.log('Referral Settings:');
  console.log('- New User Bonus: 0.05 STX');
  console.log('- Referrer Commission: 5%');
  console.log('- Code Length: 8 characters\n');

  // Demo referral registration
  setTimeout(() => {
    try {
      const demoUser = 'SP1234567890ABCDEF';
      const demoReferrer = 'SP0987654321FEDCBA';
      
      const result = referralAPI.manager.registerReferral(demoUser, demoReferrer);
      console.log(`✅ Demo referral registered: ${result.referralCode}\n`);
      
      // Generate share links
      const shareLinks = codeGenerator.generateShareLinks(result.referralCode);
      console.log('Share Links Generated:');
      console.log(`- Direct: ${shareLinks.referralUrl}`);
      console.log(`- Twitter: Available`);
      console.log(`- Telegram: Available\n`);
    } catch (error) {
      console.log('Demo referral setup skipped\n');
    }
  }, 2000);

  console.log('🎁 Referral system is ready!');
  console.log('API: http://localhost:3009');
  console.log('Features: Registration, Rewards, Leaderboard, Analytics');
}

if (require.main === module) {
  startReferral().catch(console.error);
}

module.exports = { startReferral };