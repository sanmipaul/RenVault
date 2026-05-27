const nodemailer = require('nodemailer');
const Logger = require('./logger');
const TemplateEngine = require('./templateEngine');

class EmailService {
  constructor() {
    this.logger = new Logger('EmailService');
    this.templateEngine = new TemplateEngine();
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

  _maskEmail(email) {
    if (!email || typeof email !== 'string') return 'unknown';
    return email.replace(/(.{2}).*(@.*)/, '$1***$2');
  }

  async sendWithRetry(mailOptions, retries = 3, delay = 1000) {
    const recipient = this._maskEmail(mailOptions.to);
    for (let i = 0; i < retries; i++) {
      try {
        await this.transporter.sendMail(mailOptions);
        return true;
      } catch (error) {
        if (i === retries - 1) throw error;
        this.logger.warn(`Email retry ${i + 1}/${retries} for ${recipient}: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
    return false;
  }

  async sendDepositAlert(userEmail, amount, balance) {
    if (!userEmail) return;
    const html = this.templateEngine.render('deposit.html', { amount, balance });

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '🏦 RenVault Deposit Confirmed',
      html
    };

    try {
      await this.sendWithRetry(mailOptions);
      this.logger.info('Deposit alert sent', { recipient: this._maskEmail(userEmail) });
    } catch (error) {
      this.logger.error('Email send failed after retries', { error: error.message, recipient: this._maskEmail(userEmail) });
    }
  }

  async sendWithdrawAlert(userEmail, amount, balance) {
    const html = this.templateEngine.render('withdrawal.html', { amount, balance });

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '&#x1F4B0; RenVault Withdrawal Confirmed',
      html
    };

    try {
      await this.sendWithRetry(mailOptions);
      this.logger.info('Withdrawal alert sent', { recipient: this._maskEmail(userEmail) });
    } catch (error) {
      this.logger.error('Email send failed after retries', { error: error.message, recipient: this._maskEmail(userEmail) });
    }
  }

  async sendLeaderboardUpdate(userEmail, rank, score) {
    const html = this.templateEngine.render('leaderboard.html', { rank, score });

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '&#x1F3C6; RenVault Leaderboard Update',
      html
    };

    try {
      await this.sendWithRetry(mailOptions);
      this.logger.info('Leaderboard update sent', { recipient: this._maskEmail(userEmail) });
    } catch (error) {
      this.logger.error('Email send failed after retries', { error: error.message, recipient: this._maskEmail(userEmail) });
    }
  }

  async sendStakingRewardAlert(userEmail, amount, stakedAmount) {
    const html = this.templateEngine.render('staking-reward.html', {
      amount,
      stakedAmount,
      rewardRate: '12.5'
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '&#x1F331; RenVault Staking Reward Earned',
      html
    };

    try {
      await this.sendWithRetry(mailOptions);
      this.logger.info('Staking reward alert sent', { recipient: this._maskEmail(userEmail) });
    } catch (error) {
      this.logger.error('Email send failed after retries', { error: error.message, recipient: this._maskEmail(userEmail) });
    }
  }

  async sendLiquidityRewardAlert(userEmail, amount, poolName) {
    const html = this.templateEngine.render('liquidity-reward.html', { amount, poolName });

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '&#x1F4A7; RenVault Liquidity Reward Earned',
      html
    };

    try {
      await this.sendWithRetry(mailOptions);
      this.logger.info('Liquidity reward alert sent', { recipient: this._maskEmail(userEmail) });
    } catch (error) {
      this.logger.error('Email send failed after retries', { error: error.message, recipient: this._maskEmail(userEmail) });
    }
  }

  async sendFailedLoginAlert(userEmail, ipAddress, userAgent) {
    const html = this.templateEngine.render('security-alert.html', {
      ipAddress,
      userAgent,
      timestamp: new Date().toLocaleString()
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '&#x1F6A8; RenVault Security Alert: Failed Login Attempt',
      html
    };

    try {
      await this.sendWithRetry(mailOptions);
      this.logger.info('Failed login alert sent', { recipient: this._maskEmail(userEmail) });
    } catch (error) {
      this.logger.error('Email send failed after retries', { error: error.message, recipient: this._maskEmail(userEmail) });
    }
  }

  async sendSuspiciousActivityAlert(userEmail, activity, ipAddress) {
    const html = this.templateEngine.render('suspicious-activity.html', {
      activity,
      ipAddress,
      timestamp: new Date().toLocaleString()
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '&#x1F6A8; RenVault Security Alert: Suspicious Activity',
      html
    };

    try {
      await this.sendWithRetry(mailOptions);
      this.logger.info('Suspicious activity alert sent', { recipient: this._maskEmail(userEmail) });
    } catch (error) {
      this.logger.error('Email send failed after retries', { error: error.message, recipient: this._maskEmail(userEmail) });
    }
  }

  async sendTwoFactorEnabledAlert(userEmail) {
    const html = this.templateEngine.render('2fa-update.html', {
      status: 'Enabled',
      statusIcon: '&#x2705;',
      statusMessage: 'Two-Factor Authentication Enabled',
      description: 'Two-factor authentication has been successfully enabled on your RenVault account. Your account is now more secure.'
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '&#x1F510; RenVault Security: 2FA Enabled',
      html
    };

    try {
      await this.sendWithRetry(mailOptions);
      this.logger.info('2FA enabled alert sent', { recipient: this._maskEmail(userEmail) });
    } catch (error) {
      this.logger.error('Email send failed after retries', { error: error.message, recipient: this._maskEmail(userEmail) });
    }
  }

  async sendTwoFactorDisabledAlert(userEmail) {
    const html = this.templateEngine.render('2fa-update.html', {
      status: 'Disabled',
      statusIcon: '&#x26A0;&#xFE0F;',
      statusMessage: 'Two-Factor Authentication Disabled',
      description: 'Two-factor authentication has been disabled on your RenVault account. Your account now has reduced security protection.'
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@renvault.com',
      to: userEmail,
      subject: '&#x26A0;&#xFE0F; RenVault Security: 2FA Disabled',
      html
    };

    try {
      await this.sendWithRetry(mailOptions);
      this.logger.info('2FA disabled alert sent', { recipient: this._maskEmail(userEmail) });
    } catch (error) {
      this.logger.error('Email send failed after retries', { error: error.message, recipient: this._maskEmail(userEmail) });
    }
  }

}

module.exports = EmailService;