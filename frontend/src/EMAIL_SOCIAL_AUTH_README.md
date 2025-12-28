# Email and Social Authentication Guide

## Overview

RenVault now supports email and social authentication in addition to traditional wallet connections, powered by Reown AppKit. This provides a seamless Web2-to-Web3 onboarding experience for users who may not have cryptocurrency wallets.

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Services](#services)
5. [Usage](#usage)
6. [Configuration](#configuration)
7. [Analytics](#analytics)
8. [Security](#security)
9. [Troubleshooting](#troubleshooting)

## Features

### Email Authentication
- ✅ One-Click Auth via email
- ✅ Magic link authentication (passwordless)
- ✅ Email verification workflow
- ✅ Real-time email validation
- ✅ Resend verification email
- ✅ Email verification status tracking

### Social Authentication
- ✅ Google authentication
- ✅ Twitter/X authentication
- ✅ Discord authentication
- ✅ GitHub authentication
- ✅ OAuth 2.0 flow handling
- ✅ Social provider callback processing

### Unified Authentication
- ✅ Integrated with existing wallet authentication
- ✅ Persistent authentication state
- ✅ Session management for email/social users
- ✅ Analytics tracking for all auth methods
- ✅ Error handling and user feedback

## Architecture

### Authentication Flow

```
┌─────────────────┐
│   User Visits   │
│   AuthPage      │
└────────┬────────┘
         │
         ├──────────────┬──────────────┬──────────────┐
         │              │              │              │
    ┌────▼────┐    ┌───▼────┐    ┌───▼────┐    ┌───▼────┐
    │  Email  │    │ Google │    │   X    │    │ Wallet │
    │  Login  │    │  Login │    │  Login │    │ Connect│
    └────┬────┘    └───┬────┘    └───┬────┘    └───┬────┘
         │              │              │              │
         │              └──────┬───────┘              │
         │                     │                      │
    ┌────▼──────────────┐ ┌───▼──────────────┐      │
    │ Email Verification│ │ OAuth Callback   │      │
    │  Magic Link       │ │  Handler         │      │
    └────┬──────────────┘ └───┬──────────────┘      │
         │                     │                      │
         └──────────┬──────────┴──────────────────────┘
                    │
              ┌─────▼──────┐
              │ AuthContext│
              │  (Unified) │
              └─────┬──────┘
                    │
              ┌─────▼──────┐
              │   App UI   │
              │ Authorized │
              └────────────┘
```

## Components

### 1. EmailLogin Component
**Location:** `frontend/src/components/EmailLogin.tsx`

Provides email input with real-time validation and magic link request.

```tsx
import { EmailLogin } from '../components/EmailLogin';

<EmailLogin
  onSuccess={(email) => console.log('Email sent to:', email)}
  onError={(error) => console.error('Error:', error)}
/>
```

**Features:**
- Real-time email validation
- Visual validation feedback (✓/✗)
- Loading states
- Error display
- Disabled state during submission

### 2. EmailVerification Component
**Location:** `frontend/src/components/EmailVerification.tsx`

Handles email verification workflow after magic link is sent.

```tsx
import { EmailVerification } from '../components/EmailVerification';

<EmailVerification
  email="user@example.com"
  onVerified={() => console.log('Email verified!')}
  onError={(error) => console.error('Error:', error)}
/>
```

**Features:**
- Verification status display
- Resend email with 60s cooldown
- Visual feedback (pending/verified states)
- Manual verification check

### 3. SocialLoginButtons Component
**Location:** `frontend/src/components/SocialLoginButtons.tsx`

Displays social authentication buttons for multiple providers.

```tsx
import { SocialLoginButtons } from '../components/SocialLoginButtons';

<SocialLoginButtons
  onSuccess={(provider) => console.log('Authenticated with:', provider)}
  onError={(error) => console.error('Error:', error)}
  layout="vertical" // or "horizontal"
/>
```

**Features:**
- Google, X, Discord, GitHub buttons
- Configurable layout (horizontal/vertical)
- Loading states per provider
- Error handling
- Responsive design

### 4. MagicLinkHandler Component
**Location:** `frontend/src/components/MagicLinkHandler.tsx`

Processes magic link authentication callbacks from URL.

```tsx
import { MagicLinkHandler } from '../components/MagicLinkHandler';

<MagicLinkHandler
  onSuccess={() => console.log('Magic link verified!')}
  onError={(error) => console.error('Error:', error)}
  redirectTo="/dashboard"
/>
```

**Features:**
- URL token extraction
- Verification processing
- Success/error states
- Automatic redirect on success
- Retry functionality

### 5. AuthPage
**Location:** `frontend/src/pages/AuthPage.tsx`

Complete authentication page integrating all auth methods.

**Features:**
- Email login form
- Social login buttons
- Wallet connection option
- Email verification view
- Error banner display
- Analytics integration

## Services

### 1. EmailAuthService
**Location:** `frontend/src/services/email-auth-service.ts`

Handles email-based authentication operations.

```typescript
import { EmailAuthService } from '../services/email-auth-service';

const emailAuth = EmailAuthService.getInstance();

// Validate email
const isValid = emailAuth.validateEmail('user@example.com');

// Initiate email authentication
await emailAuth.authenticateWithEmail('user@example.com');

// Handle magic link callback
const success = await emailAuth.handleMagicLinkCallback(token);

// Check verification status
const isVerified = await emailAuth.isEmailVerified();

// Send verification email
await emailAuth.sendVerificationEmail('user@example.com');

// Logout
await emailAuth.logout();
```

### 2. SocialAuthService
**Location:** `frontend/src/services/social-auth-service.ts`

Handles social provider authentication.

```typescript
import { SocialAuthService } from '../services/social-auth-service';

const socialAuth = SocialAuthService.getInstance();

// Authenticate with specific provider
await socialAuth.authenticateWithGoogle();
await socialAuth.authenticateWithX();
await socialAuth.authenticateWithDiscord();
await socialAuth.authenticateWithGitHub();

// Generic authentication
await socialAuth.authenticateWithSocial('google');

// Handle OAuth callback
const result = await socialAuth.handleSocialCallback('google', code);

// Get auth status
const status = await socialAuth.getSocialAuthStatus();

// Get supported providers
const providers = socialAuth.getSupportedProviders();

// Logout
await socialAuth.logout();
```

### 3. AuthContext
**Location:** `frontend/src/context/AuthContext.tsx`

Unified authentication state management.

```typescript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const {
    user,
    isAuthenticated,
    isLoading,
    authenticateWithEmail,
    authenticateWithSocial,
    logout,
    checkAuthStatus,
  } = useAuth();

  // Use authentication state
  if (isAuthenticated) {
    console.log('User method:', user.method); // 'email' | 'social' | 'wallet'
    console.log('Provider:', user.provider); // For social: 'google' | 'x' | etc.
  }

  return <div>{/* Your UI */}</div>;
}
```

### 4. AuthAnalyticsService
**Location:** `frontend/src/services/auth-analytics-service.ts`

Tracks authentication events for analytics.

```typescript
import { AuthAnalyticsService } from '../services/auth-analytics-service';

const analytics = AuthAnalyticsService.getInstance();

// Track events
analytics.trackEmailAuthStarted('user@example.com');
analytics.trackEmailVerificationSent('user@example.com');
analytics.trackEmailVerificationCompleted('user@example.com');
analytics.trackSocialAuthStarted('google');
analytics.trackSocialAuthCompleted('google', userId);
analytics.trackAuthFailure('email', 'Invalid email format');
analytics.trackAuthMethodSelected('social', 'google');
analytics.trackLogout('email');
analytics.trackMagicLinkClick('user@example.com');
analytics.trackSessionDuration('email', durationMs);

// Get summary
const summary = analytics.getAuthAnalyticsSummary();
```

## Usage

### Basic Setup

1. **Wrap your app with AuthProvider:**

```tsx
import { AuthProvider } from './context/AuthContext';
import { WalletProvider } from './context/WalletProvider';

function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        {/* Your app components */}
      </WalletProvider>
    </AuthProvider>
  );
}
```

2. **Use the AuthPage:**

```tsx
import { AuthPage } from './pages/AuthPage';

// In your router
<Route path="/auth" element={<AuthPage />} />
```

3. **Check authentication status:**

```tsx
import { useAuth } from './context/AuthContext';

function ProtectedRoute() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  return <div>Protected content</div>;
}
```

## Configuration

### AppKit Configuration

The email and social authentication is enabled in the AppKit configuration:

**File:** `frontend/src/services/appkit-service.ts`

```typescript
features: {
  analytics: true,
  email: true,  // Enable email authentication
  socials: ['google', 'x', 'discord', 'github'],  // Enable social providers
  history: true,
}
```

### Supported Social Providers

- **Google** - OAuth 2.0
- **X (Twitter)** - OAuth 2.0
- **Discord** - OAuth 2.0
- **GitHub** - OAuth 2.0

## Analytics

All authentication events are tracked for analytics:

### Tracked Events

1. **email_auth_started** - User initiates email authentication
2. **email_verification_sent** - Verification email sent
3. **email_verification_completed** - Email verified successfully
4. **social_auth_started** - Social authentication initiated
5. **social_auth_completed** - Social authentication successful
6. **auth_failure** - Authentication failed
7. **auth_method_selected** - User selected an auth method
8. **user_logout** - User logged out
9. **magic_link_clicked** - User clicked magic link
10. **auth_session_duration** - Session duration tracked

### Event Properties

- `authMethod`: 'email' | 'social' | 'wallet'
- `provider`: 'google' | 'x' | 'discord' | 'github' (for social)
- `emailDomain`: Domain of email (privacy-preserving)
- `errorMessage`: Error description (for failures)
- `durationMs`: Session duration in milliseconds

## Security

### Email Authentication
- **Email validation**: Client-side and server-side validation
- **Magic links**: Time-limited, single-use tokens
- **Rate limiting**: Resend cooldown (60 seconds)
- **Token expiration**: Magic links expire after a set time

### Social Authentication
- **OAuth 2.0**: Industry-standard authentication
- **State validation**: CSRF protection
- **Redirect URI validation**: Prevents open redirects
- **Token verification**: Validates OAuth tokens

### Session Management
- **Secure storage**: Sessions stored securely
- **Session expiration**: Automatic timeout
- **Logout handling**: Complete session cleanup

## Troubleshooting

### Email Authentication Issues

**Problem: Email not received**
- Check spam/junk folder
- Verify email address is correct
- Wait 60 seconds before resending
- Check email service provider status

**Problem: Magic link expired**
- Request a new magic link
- Links typically expire after 15-30 minutes

**Problem: Email validation failing**
- Ensure email format is correct (user@domain.com)
- Check for typos or extra spaces

### Social Authentication Issues

**Problem: OAuth callback fails**
- Verify callback URL is whitelisted
- Check browser allows third-party cookies
- Ensure popup blockers are disabled

**Problem: Provider not responding**
- Check provider service status
- Verify OAuth app credentials
- Check network connectivity

**Problem: Authentication loops**
- Clear browser cache and cookies
- Try incognito/private mode
- Check for browser extensions blocking OAuth

### General Issues

**Problem: Authentication state not persisting**
- Check localStorage is enabled
- Verify session storage is working
- Check AuthProvider is wrapping the app

**Problem: Analytics not tracking**
- Verify AnalyticsService is initialized
- Check console for analytics errors
- Ensure proper event names are used

## Best Practices

1. **Always handle errors gracefully**
   - Display user-friendly error messages
   - Log errors for debugging
   - Provide retry mechanisms

2. **Track authentication events**
   - Monitor conversion rates
   - Identify popular auth methods
   - Track failure points

3. **Optimize user experience**
   - Minimize form fields
   - Provide clear instructions
   - Show loading states

4. **Maintain security**
   - Never store sensitive tokens in localStorage
   - Use HTTPS for all authentication
   - Implement proper CORS policies

5. **Test thoroughly**
   - Test all auth flows
   - Test error scenarios
   - Test on multiple devices/browsers

## Support

For issues or questions:
- Check the [AppKit Documentation](https://docs.reown.com/appkit/overview)
- Review the [Authentication Guide](https://docs.reown.com/appkit/features/authentication)
- File an issue in the project repository

## License

This implementation is part of RenVault and follows the project's license.
