# Migration Guide: Email and Social Authentication

This guide helps you migrate existing authentication code to use the new email and social authentication features.

## Quick Migration Checklist

- [ ] Update AppKit configuration
- [ ] Wrap app with AuthProvider
- [ ] Update authentication checks
- [ ] Add email/social login UI
- [ ] Update analytics tracking
- [ ] Test all authentication flows

## Step-by-Step Migration

### 1. Configuration Update

**Before:**
```typescript
// frontend/src/services/appkit-service.ts
features: {
  analytics: true,
  email: false,
  socials: false,
  history: true,
}
```

**After:**
```typescript
features: {
  analytics: true,
  email: true,
  socials: ['google', 'x', 'discord', 'github'],
  history: true,
}
```

### 2. Provider Wrapping

**Before:**
```tsx
import { WalletProvider } from './context/WalletProvider';

function App() {
  return (
    <WalletProvider>
      {/* Your app */}
    </WalletProvider>
  );
}
```

**After:**
```tsx
import { AuthProvider } from './context/AuthContext';
import { WalletProvider } from './context/WalletProvider';

function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        {/* Your app */}
      </WalletProvider>
    </AuthProvider>
  );
}
```

### 3. Authentication Checks

**Before:**
```tsx
import { useWalletContext } from './context/WalletProvider';

function MyComponent() {
  const { isConnected } = useWalletContext();

  if (!isConnected) {
    return <div>Connect wallet</div>;
  }

  return <div>Authenticated content</div>;
}
```

**After:**
```tsx
import { useAuth } from './context/AuthContext';
import { useWalletContext } from './context/WalletProvider';

function MyComponent() {
  const { isAuthenticated, user } = useAuth();
  const { isConnected } = useWalletContext();

  if (!isAuthenticated && !isConnected) {
    return <div>Please sign in</div>;
  }

  // Now you can check authentication method
  const authMethod = user?.method || (isConnected ? 'wallet' : null);

  return <div>Authenticated via {authMethod}</div>;
}
```

### 4. Login UI Updates

**Before:**
```tsx
function LoginPage() {
  return (
    <div>
      <button onClick={connectWallet}>Connect Wallet</button>
    </div>
  );
}
```

**After:**
```tsx
import { EmailLogin } from './components/EmailLogin';
import { SocialLoginButtons } from './components/SocialLoginButtons';

function LoginPage() {
  return (
    <div>
      <EmailLogin
        onSuccess={(email) => console.log('Email login:', email)}
        onError={(err) => console.error(err)}
      />

      <SocialLoginButtons
        onSuccess={(provider) => console.log('Social login:', provider)}
        onError={(err) => console.error(err)}
      />

      <div className="divider">Or</div>

      <button onClick={connectWallet}>Connect Wallet</button>
    </div>
  );
}
```

### 5. Analytics Migration

**Before:**
```typescript
import { AnalyticsService } from './services/analytics-service';

const analytics = AnalyticsService.getInstance();
analytics.trackEvent('user_login', { method: 'wallet' });
```

**After:**
```typescript
import { AuthAnalyticsService } from './services/auth-analytics-service';

const authAnalytics = AuthAnalyticsService.getInstance();

// Email authentication
authAnalytics.trackEmailAuthStarted('user@example.com');
authAnalytics.trackEmailVerificationCompleted('user@example.com');

// Social authentication
authAnalytics.trackSocialAuthStarted('google');
authAnalytics.trackSocialAuthCompleted('google', userId);

// General
authAnalytics.trackAuthMethodSelected('email');
authAnalytics.trackLogout('social', 'google');
```

### 6. Protected Routes

**Before:**
```tsx
function ProtectedRoute({ children }) {
  const { isConnected } = useWalletContext();

  if (!isConnected) {
    return <Navigate to="/connect" />;
  }

  return children;
}
```

**After:**
```tsx
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const { isConnected } = useWalletContext();

  if (!isAuthenticated && !isConnected) {
    return <Navigate to="/auth" />;
  }

  return children;
}
```

### 7. User Profile Display

**Before:**
```tsx
function UserProfile() {
  const { connectionState } = useWalletContext();

  return (
    <div>
      <p>Address: {connectionState?.address}</p>
    </div>
  );
}
```

**After:**
```tsx
import { useAuth } from './context/AuthContext';

function UserProfile() {
  const { user } = useAuth();
  const { connectionState, authMethod } = useWalletContext();

  return (
    <div>
      {authMethod === 'wallet' && (
        <p>Address: {connectionState?.address}</p>
      )}

      {authMethod === 'email' && (
        <p>Email: {user?.email}</p>
      )}

      {authMethod === 'social' && (
        <>
          <p>Provider: {user?.provider}</p>
          <p>Name: {user?.displayName}</p>
        </>
      )}
    </div>
  );
}
```

## Breaking Changes

### None!

This implementation is **backward compatible**. Existing wallet-based authentication continues to work without any changes.

## New Features Available

1. **Email Authentication**
   - `EmailLogin` component
   - `EmailVerification` component
   - `EmailAuthService` for programmatic access

2. **Social Authentication**
   - `SocialLoginButtons` component
   - `SocialAuthService` for all providers
   - Support for Google, X, Discord, GitHub

3. **Unified Auth Context**
   - `useAuth()` hook for authentication state
   - Works alongside existing `useWalletContext()`

4. **Analytics**
   - `AuthAnalyticsService` for tracking auth events
   - Automatic event tracking for all auth methods

5. **Components**
   - `AuthPage` - complete authentication page
   - `MagicLinkHandler` - email verification
   - Pre-styled, production-ready UI

## Testing Your Migration

### 1. Test Email Login
```bash
# Navigate to /auth page
# Enter email address
# Check email for magic link
# Click link and verify redirect
```

### 2. Test Social Login
```bash
# Navigate to /auth page
# Click a social provider button
# Complete OAuth flow
# Verify successful authentication
```

### 3. Test Wallet Login (Existing)
```bash
# Navigate to connect page
# Connect wallet as before
# Verify everything still works
```

### 4. Test Mixed Authentication
```bash
# Sign in with email
# Sign out
# Sign in with Google
# Sign out
# Connect wallet
# Verify all methods work independently
```

## Common Issues & Solutions

### Issue: AuthContext not found
**Solution:** Ensure `AuthProvider` wraps your app before components use `useAuth()`

```tsx
// Correct order
<AuthProvider>
  <WalletProvider>
    <YourComponents />
  </WalletProvider>
</AuthProvider>
```

### Issue: Types not found
**Solution:** Import from the correct locations

```tsx
// Correct
import { AuthMethod, SocialProvider } from './types/auth';

// Or use centralized exports
import { AuthMethod, SocialProvider } from './auth';
```

### Issue: Email validation not working
**Solution:** Use the EmailAuthService validator

```typescript
import { EmailAuthService } from './services/email-auth-service';

const emailAuth = EmailAuthService.getInstance();
const isValid = emailAuth.validateEmail(email);
```

## Rollback Plan

If you need to rollback:

1. **Revert configuration:**
```typescript
features: {
  email: false,
  socials: false,
}
```

2. **Remove AuthProvider:**
```tsx
// Simply remove the AuthProvider wrapper
// Existing wallet auth will continue to work
```

3. **Remove new components:**
```bash
# Remove auth components from your routes
# Remove email/social login buttons from UI
```

## Support & Resources

- [Email/Social Auth README](./EMAIL_SOCIAL_AUTH_README.md)
- [Integration Examples](./examples/auth-integration-examples.tsx)
- [AppKit Documentation](https://docs.reown.com/appkit/overview)
- [Auth Type Definitions](./types/auth.ts)

## Next Steps

After migration:

1. **Update documentation** - Document the new auth options for your users
2. **Monitor analytics** - Track adoption of email/social auth
3. **Collect feedback** - Get user feedback on new auth methods
4. **Optimize** - Improve based on usage patterns

## Questions?

If you encounter issues during migration, check:
- Console for error messages
- Browser network tab for failed requests
- Email spam folder for magic links
- OAuth provider settings for correct callback URLs
