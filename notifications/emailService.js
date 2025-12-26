const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendDepositAlert(userEmail, amount, balance) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '🏦 RenVault Deposit Confirmed',
      html: `
        <h2>Deposit Successful!</h2>
        <p>Your deposit of <strong>${amount} STX</strong> has been confirmed.</p>
        <p>New vault balance: <strong>${balance} STX</strong></p>
        <p>Thank you for using RenVault!</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Deposit alert sent to ${userEmail}`);
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
    }
  }

  async sendWithdrawAlert(userEmail, amount, balance) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '💰 RenVault Withdrawal Confirmed',
      html: `
        <h2>Withdrawal Successful!</h2>
        <p>Your withdrawal of <strong>${amount} STX</strong> has been processed.</p>
        <p>Remaining vault balance: <strong>${balance} STX</strong></p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Withdrawal alert sent to ${userEmail}`);
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
    }
  }

  async sendLeaderboardUpdate(userEmail, rank, score) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '🏆 RenVault Leaderboard Update',
      html: `
        <h2>Leaderboard Position Update!</h2>
        <p>Your current rank: <strong>#${rank}</strong></p>
        <p>Your score: <strong>${score}</strong></p>
        <p>Keep saving to climb higher!</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Leaderboard update sent to ${userEmail}`);
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
    }
  }

  async sendStakingRewardAlert(userEmail, amount, stakedAmount) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '🌱 RenVault Staking Reward Earned',
      html: `
        <h2>Staking Reward Received!</h2>
        <p>You've earned <strong>${amount} STX</strong> in staking rewards!</p>
        <p>Current staked amount: <strong>${stakedAmount} STX</strong></p>
        <p>Your rewards are automatically compounded for maximum yield.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Staking reward alert sent to ${userEmail}`);
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
    }
  }

  async sendLiquidityRewardAlert(userEmail, amount, poolName) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '💧 RenVault Liquidity Reward Earned',
      html: `
        <h2>Liquidity Reward Received!</h2>
        <p>You've earned <strong>${amount} STX</strong> from liquidity provision!</p>
        <p>Pool: <strong>${poolName}</strong></p>
        <p>Thank you for providing liquidity to RenVault!</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Liquidity reward alert sent to ${userEmail}`);
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
    }
  }

  async sendFailedLoginAlert(userEmail, ipAddress, userAgent) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '🚨 RenVault Security Alert: Failed Login Attempt',
      html: `
        <h2>Security Alert: Failed Login Attempt</h2>
        <p>We detected a failed login attempt to your RenVault account.</p>
        <p><strong>IP Address:</strong> ${ipAddress}</p>
        <p><strong>User Agent:</strong> ${userAgent}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p>If this wasn't you, please secure your account immediately.</p>
        <p>Consider enabling 2FA if you haven't already.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Failed login alert sent to ${userEmail}`);
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
    }
  }

  async sendSuspiciousActivityAlert(userEmail, activity, ipAddress) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '🚨 RenVault Security Alert: Suspicious Activity',
      html: `
        <h2>Security Alert: Suspicious Activity Detected</h2>
        <p>We detected suspicious activity on your RenVault account.</p>
        <p><strong>Activity:</strong> ${activity}</p>
        <p><strong>IP Address:</strong> ${ipAddress}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p>If this wasn't you, please contact support immediately.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Suspicious activity alert sent to ${userEmail}`);
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
    }
  }

  async sendTwoFactorEnabledAlert(userEmail) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '🔐 RenVault Security: 2FA Enabled',
      html: `
        <h2>Two-Factor Authentication Enabled</h2>
        <p>Two-factor authentication has been successfully enabled on your RenVault account.</p>
        <p>Your account is now more secure with an additional layer of protection.</p>
        <p>Remember to keep your backup codes safe!</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ 2FA enabled alert sent to ${userEmail}`);
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
    }
  }

  async sendTwoFactorDisabledAlert(userEmail) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '⚠️ RenVault Security: 2FA Disabled',
      html: `
        <h2>Two-Factor Authentication Disabled</h2>
        <p>Two-factor authentication has been disabled on your RenVault account.</p>
        <p>Your account now has reduced security. We recommend re-enabling 2FA.</p>
        <p>If you didn't make this change, please contact support immediately.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ 2FA disabled alert sent to ${userEmail}`);
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
    }
  }
}

module.exports = EmailService;