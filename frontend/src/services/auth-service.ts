import appKit from './appkit-service';

// -------------------
// Types
// -------------------
type SocialProvider = 'google' | 'x' | 'discord' | 'github';

interface Session {
  id: string;
  user: any;
  token?: string;
}

// -------------------
// Utility: Save session
// -------------------
const saveSession = (session: Session) => {
  try {
    localStorage.setItem('userSession', JSON.stringify(session));
  } catch (error) {
    console.warn('Failed to save session in localStorage', error);
  }
};

// -------------------
// Email Login
// -------------------
export const loginWithEmail = async (email: string): Promise<Session> => {
  try {
    const session = await appKit.auth.email.login({ email });
    saveSession(session);
    return session;
  } catch (error) {
    console.error('Email login error:', error);
    throw error;
  }
};

export const verifyEmail = async (token: string) => {
  try {
    await appKit.auth.email.verify(token);
    console.log('Email verified successfully');
  } catch (error) {
    console.error('Email verification error:', error);
    throw error;
  }
};

// -------------------
// Social Login
// -------------------
export const loginWithSocial = async (provider: SocialProvider): Promise<Session> => {
  try {
    const session = await appKit.auth.social.login({ provider });
    saveSession(session);
    return session;
  } catch (error) {
    console.error(`${provider} login error:`, error);
    throw error;
  }
};

// -------------------
// Session Utilities
// -------------------
export const getCurrentSession = (): Session | null => {
  try {
    const session = localStorage.getItem('userSession');
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.warn('Failed to read session from localStorage', error);
    return null;
  }
};

export const logout = () => {
  try {
    localStorage.removeItem('userSession');
    appKit.auth.logout();
  } catch (error) {
    console.warn('Failed to logout properly', error);
  }
};
