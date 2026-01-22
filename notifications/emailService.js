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

module.exports = EmailService;