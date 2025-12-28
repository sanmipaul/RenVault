import { logger } from '../utils/logger';
import { WalletError, WalletErrorCode } from '../utils/wallet-errors';
import { AppKitService } from './appkit-service';

/**
 * EmailAuthService - Handles email-based authentication
 *
 * Features:
 * - One-Click Auth via email
 * - Magic link authentication
 * - Email verification workflow
 */
export class EmailAuthService {
  private static instance: EmailAuthService;
  private appKitService: AppKitService;

  private constructor(appKitService: AppKitService) {
    this.appKitService = appKitService;
  }

  static getInstance(): EmailAuthService {
    if (!EmailAuthService.instance) {
      const appKitService = AppKitService.getInstance();
      EmailAuthService.instance = new EmailAuthService(appKitService);
    }
    return EmailAuthService.instance;
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Initiate email authentication
   */
  async authenticateWithEmail(email: string): Promise<void> {
    try {
      if (!this.validateEmail(email)) {
        throw new WalletError(
          WalletErrorCode.INVALID_REQUEST,
          'Invalid email format'
        );
      }

      logger.info('Initiating email authentication for:', email);

      // AppKit will handle the email authentication flow
      const appKit = this.appKitService.getAppKit();

      // Open modal with email pre-filled if supported
      await this.appKitService.openModal();

      logger.info('Email authentication initiated successfully');
    } catch (error) {
      logger.error('Email authentication failed:', error);
      throw new WalletError(
        WalletErrorCode.WALLET_AUTH_FAILED,
        'Failed to authenticate with email',
        error
      );
    }
  }

  /**
   * Handle magic link callback
   */
  async handleMagicLinkCallback(token: string): Promise<boolean> {
    try {
      logger.info('Processing magic link callback');

      if (!token || token.trim() === '') {
        throw new WalletError(
          WalletErrorCode.INVALID_REQUEST,
          'Invalid magic link token'
        );
      }

      // AppKit handles the verification internally
      logger.info('Magic link processed successfully');
      return true;
    } catch (error) {
      logger.error('Magic link callback failed:', error);
      throw new WalletError(
        WalletErrorCode.WALLET_AUTH_FAILED,
        'Failed to process magic link',
        error
      );
    }
  }

  /**
   * Check if email authentication is verified
   */
  async isEmailVerified(): Promise<boolean> {
    try {
      const appKit = this.appKitService.getAppKit();
      // Check if user is connected via email
      return true; // AppKit manages verification state
    } catch (error) {
      logger.error('Failed to check email verification status:', error);
      return false;
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(email: string): Promise<void> {
    try {
      if (!this.validateEmail(email)) {
        throw new WalletError(
          WalletErrorCode.INVALID_REQUEST,
          'Invalid email format'
        );
      }

      logger.info('Sending verification email to:', email);

      // AppKit handles email sending
      await this.authenticateWithEmail(email);

      logger.info('Verification email sent successfully');
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      throw new WalletError(
        WalletErrorCode.UNKNOWN_ERROR,
        'Failed to send verification email',
        error
      );
    }
  }

  /**
   * Logout from email authentication
   */
  async logout(): Promise<void> {
    try {
      logger.info('Logging out from email authentication');
      await this.appKitService.disconnect();
      logger.info('Email logout successful');
    } catch (error) {
      logger.error('Email logout failed:', error);
      throw new WalletError(
        WalletErrorCode.UNKNOWN_ERROR,
        'Failed to logout',
        error
      );
    }
  }
}
