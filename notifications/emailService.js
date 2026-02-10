const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const Logger = require('./logger');

class EmailService {
  constructor() {
    this.logger = new Logger('EmailService');
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

  async sendWithRetry(mailOptions, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        await this.transporter.sendMail(mailOptions);
        return true;
      } catch (error) {
        if (i === retries - 1) throw error;
        this.logger.warn(`Email retry ${i + 1}/${retries} after error: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
    return false;
  }

  async sendDepositAlert(userEmail, amount, balance) {
    const template = this.loadTemplate('deposit.html');
    const html = this.renderTemplate(template, { amount, balance });

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '🏦 RenVault Deposit Confirmed',
      html
    };

    try {
      await this.sendWithRetry(mailOptions);
      this.logger.info(`Deposit alert sent to ${userEmail}`);
    } catch (error) {
      this.logger.error('Email send failed after retries', { error: error.message, userEmail });
    }
  }

  async sendWithdrawAlert(userEmail, amount, balance) {
    const template = this.loadTemplate('deposit.html'); // Reuse deposit template structure
    const html = this.renderTemplate(template, {
      amount,
      balance,
      title: 'Withdrawal Confirmed',
      message: 'Your STX withdrawal has been processed successfully.'
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '💰 RenVault Withdrawal Confirmed',
      html: html.replace('Deposit Confirmed', 'Withdrawal Confirmed').replace('Deposit Successful', 'Withdrawal Successful')
    };

    try {
      await this.sendWithRetry(mailOptions);
      this.logger.info(`Withdrawal alert sent to ${userEmail}`);
    } catch (error) {
      this.logger.error('Email send failed after retries', { error: error.message, userEmail });
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
      await this.sendWithRetry(mailOptions);
      this.logger.info(`Leaderboard update sent to ${userEmail}`);
    } catch (error) {
      this.logger.error('Email send failed after retries', { error: error.message, userEmail });
    }
  }

  async sendStakingRewardAlert(userEmail, amount, stakedAmount) {
    const template = this.loadTemplate('staking-reward.html');
    const html = this.renderTemplate(template, {
      amount,
      stakedAmount,
      rewardRate: '12.5' // This could be dynamic based on current rates
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '🌱 RenVault Staking Reward Earned',
      html
    };

    try {
      await this.sendWithRetry(mailOptions);
      this.logger.info(`Staking reward alert sent to ${userEmail}`);
    } catch (error) {
      this.logger.error('Email send failed after retries', { error: error.message, userEmail });
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
      await this.sendWithRetry(mailOptions);
      this.logger.info(`Liquidity reward alert sent to ${userEmail}`);
    } catch (error) {
      this.logger.error('Email send failed after retries', { error: error.message, userEmail });
    }
  }

  async sendFailedLoginAlert(userEmail, ipAddress, userAgent) {
    const template = this.loadTemplate('security-alert.html');
    const html = this.renderTemplate(template, {
      ipAddress,
      userAgent,
      timestamp: new Date().toLocaleString()
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '🚨 RenVault Security Alert: Failed Login Attempt',
      html
    };

    try {
      await this.sendWithRetry(mailOptions);
      this.logger.info(`Failed login alert sent to ${userEmail}`);
    } catch (error) {
      this.logger.error('Email send failed after retries', { error: error.message, userEmail });
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
      await this.sendWithRetry(mailOptions);
      this.logger.info(`Suspicious activity alert sent to ${userEmail}`);
    } catch (error) {
      this.logger.error('Email send failed after retries', { error: error.message, userEmail });
    }
  }

  async sendTwoFactorEnabledAlert(userEmail) {
    const template = this.loadTemplate('2fa-update.html');
    const html = this.renderTemplate(template, {
      status: 'Enabled',
      statusIcon: '✅',
      statusMessage: 'Two-Factor Authentication Enabled',
      description: 'Two-factor authentication has been successfully enabled on your RenVault account. Your account is now more secure.',
      backupCodes: null // No backup codes for enable notification
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '🔐 RenVault Security: 2FA Enabled',
      html
    };

    try {
      await this.sendWithRetry(mailOptions);
      this.logger.info(`2FA enabled alert sent to ${userEmail}`);
    } catch (error) {
      this.logger.error('Email send failed after retries', { error: error.message, userEmail });
    }
  }

  async sendTwoFactorDisabledAlert(userEmail) {
    const template = this.loadTemplate('2fa-update.html');
    const html = this.renderTemplate(template, {
      status: 'Disabled',
      statusIcon: '⚠️',
      statusMessage: 'Two-Factor Authentication Disabled',
      description: 'Two-factor authentication has been disabled on your RenVault account. Your account now has reduced security protection.'
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '⚠️ RenVault Security: 2FA Disabled',
      html
    };

    try {
      await this.sendWithRetry(mailOptions);
      this.logger.info(`2FA disabled alert sent to ${userEmail}`);
    } catch (error) {
      this.logger.error('Email send failed after retries', { error: error.message, userEmail });
    }
  }

  loadTemplate(templateName) {
    const templatePath = path.join(__dirname, 'templates', templateName);
    return fs.readFileSync(templatePath, 'utf8');
  }

  renderTemplate(template, data) {
    let rendered = template;
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, value);
    }
    return rendered;
  }
}

module.exports = EmailService;