import React, { useState, useEffect } from 'react';
import Email from './pages/Email';

export default function App() {
  const [user, setUser] = useState(null);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3500/auth/user', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          const userData = {
            name:
              data.user.displayName ||
              `${data.user.name?.givenName || ''} ${data.user.name?.familyName || ''}`.trim() ||
              'User',
            email: data.user.emails?.[0]?.value || data.user.email || '',
            picture: data.user.photos?.[0]?.value || data.user.picture || '',
          };
          setUser(userData);
        } else setUser(null);
      })
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetch('http://localhost:3500/api/gmail/emails', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.emails) {
            setEmails(data.emails);
            setError(null);
          } else setError('Failed to load emails.');
        })
        .catch(() => setError('Something went wrong while fetching emails.'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const googleLogin = () => {
    window.location.href = 'http://localhost:3500/auth/google';
  };

  const logout = () => {
    fetch('http://localhost:3500/auth/logout', { credentials: 'include' }).then(() => setUser(null));
  };

  if (!user) {
    return (
      <main className="app-container">
        <section className="login-card">
          <h1 className="title">GmailGenius</h1>
          <p className="subtitle">Unlock the power of your Gmail inbox</p>
          <button onClick={googleLogin} className="google-btn">
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="G" style={{ width: 20 }} />
            Sign in with Google
          </button>
        </section>
      </main>
    );
  }

  return (
    <Email user={user} emails={emails} onLogout={logout} loading={loading} error={error} />
  );
}
