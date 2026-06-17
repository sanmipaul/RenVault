import React, { useState } from 'react';
import { loginWithEmail, loginWithSocial } from '../services/auth-service';
import { useSessionContext } from '../context/session';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // optional styling

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { setCurrentSession } = useSessionContext(); // update global session
  const navigate = useNavigate(); // redirect

  // Handle email login
  const handleEmailLogin = async () => {
    if (!email) return alert('Please enter your email');
    setLoading(true);
    try {
      const session = await loginWithEmail(email);
      setCurrentSession(session); // save session in context
      alert('Magic link sent! Check your email.');
      navigate('/dashboard'); // redirect after login
    } catch (error) {
      console.error(error);
      alert('Email login failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle social login
  const handleSocialLogin = async (
    provider: 'google' | 'x' | 'discord' | 'github'
  ) => {
    setLoading(true);
    try {
      const session = await loginWithSocial(provider);
      setCurrentSession(session); // save session in context
      alert(`Logged in with ${provider}`);
      navigate('/dashboard'); // redirect after login
    } catch (error) {
      console.error(error);
      alert(`${provider} login failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      {/* Email Login */}
      <div className="email-login">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleEmailLogin} disabled={loading}>
          {loading ? 'Loading...' : 'Login with Email'}
        </button>
      </div>

      <hr />

      {/* Social Login Buttons */}
      <div className="social-login">
        <button onClick={() => handleSocialLogin('google')} disabled={loading}>
          Login with Google
        </button>
        <button onClick={() => handleSocialLogin('x')} disabled={loading}>
          Login with X
        </button>
        <button onClick={() => handleSocialLogin('discord')} disabled={loading}>
          Login with Discord
        </button>
        <button onClick={() => handleSocialLogin('github')} disabled={loading}>
          Login with GitHub
        </button>
      </div>
    </div>
  );
};

export default Login;
