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

  async sendVaultCreatedAlert(userEmail, vaultId, vaultType) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '🏦 New Vault Created',
      html: `
        <h2>Vault Created Successfully!</h2>
        <p>A new ${vaultType} vault has been created.</p>
        <p>Vault ID: <strong>${vaultId}</strong></p>
        <p>You can now start depositing assets into this vault.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Vault created alert sent to ${userEmail}`);
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
    }
  }

  async sendVaultUpdatedAlert(userEmail, vaultId, changes) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '🔄 Vault Parameters Updated',
      html: `
        <h2>Vault Updated!</h2>
        <p>Vault ID: <strong>${vaultId}</strong></p>
        <p>Changes: <strong>${changes}</strong></p>
        <p>Please review the updated vault parameters.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Vault updated alert sent to ${userEmail}`);
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
    }
  }

  async sendRewardsDistributedAlert(userEmail, vaultId, amount) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '💰 Rewards Distributed',
      html: `
        <h2>Rewards Earned!</h2>
        <p>You've received <strong>${amount} STX</strong> in rewards.</p>
        <p>Vault ID: <strong>${vaultId}</strong></p>
        <p>Thank you for participating in the RenVault ecosystem!</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Rewards distributed alert sent to ${userEmail}`);
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
    }
  }

  async sendVaultMaturityAlert(userEmail, vaultId, daysRemaining) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '⏰ Vault Maturity Approaching',
      html: `
        <h2>Vault Maturity Notice</h2>
        <p>Your vault <strong>${vaultId}</strong> is approaching maturity.</p>
        <p>Days remaining: <strong>${daysRemaining}</strong></p>
        <p>Please consider your next steps for this vault.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Vault maturity alert sent to ${userEmail}`);
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
    }
  }

  async sendPriceAlert(userEmail, asset, price, change) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '📈 Price Alert',
      html: `
        <h2>Price Alert Triggered</h2>
        <p>Asset: <strong>${asset}</strong></p>
        <p>Current Price: <strong>${price}</strong></p>
        <p>Change: <strong>${change}%</strong></p>
        <p>This is based on your configured price alert settings.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Price alert sent to ${userEmail}`);
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
    }
  }

  async sendLargeTransactionAlert(userEmail, amount, type) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '🚨 Large Transaction Alert',
      html: `
        <h2>Security Alert: Large Transaction</h2>
        <p>A large ${type} transaction of <strong>${amount} STX</strong> has been detected.</p>
        <p>If this was not you, please secure your account immediately.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Large transaction alert sent to ${userEmail}`);
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
    }
  }

  async sendMultisigAlert(userEmail, requestId, action) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '🔐 Multi-signature Request',
      html: `
        <h2>Multi-signature Approval Required</h2>
        <p>Request ID: <strong>${requestId}</strong></p>
        <p>Action: <strong>${action}</strong></p>
        <p>Your approval is required for this multi-signature transaction.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Multisig alert sent to ${userEmail}`);
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
    }
  }

  async sendSessionExpirationAlert(userEmail, minutesRemaining) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '⏳ Session Expiration Warning',
      html: `
        <h2>Session Expiring Soon</h2>
        <p>Your session will expire in <strong>${minutesRemaining} minutes</strong>.</p>
        <p>Please save your work or extend your session to avoid losing progress.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Session expiration alert sent to ${userEmail}`);
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
    }
  }

module.exports = EmailService;