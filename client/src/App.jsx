// src/App.jsx
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard'; // ✅ Use your new dashboard

export default function App() {
  const [user, setUser] = useState(null);
  const [emails, setEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [selectedTag, setSelectedTag] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tagEmail = (email) => {
    const subject = (email.subject || '').toLowerCase();
    if (subject.includes('internship')) return 'Internship';
    if (subject.includes('job')) return 'Job';
    if (subject.includes('offer')) return 'Offer';
    return 'Other';
  };

  useEffect(() => {
    fetch('http://localhost:3500/auth/user', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          const userData = {
            name: data.user.displayName || `${data.user.name?.givenName || ''} ${data.user.name?.familyName || ''}`.trim() || 'User',
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
            const taggedEmails = data.emails.map(email => ({
              ...email,
              tag: tagEmail(email),
            }));
            setEmails(taggedEmails);
            setFilteredEmails(taggedEmails);
            setError(null);
          } else setError('Failed to load emails.');
        })
        .catch(() => setError('Something went wrong while fetching emails.'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  useEffect(() => {
    if (selectedTag === 'All') {
      setFilteredEmails(emails);
    } else {
      setFilteredEmails(emails.filter(email => email.tag === selectedTag));
    }
  }, [selectedTag, emails]);

  const googleLogin = () => {
    window.location.href = 'http://localhost:3500/auth/google';
  };

  const logout = () => {
    fetch('http://localhost:3500/auth/logout', { credentials: 'include' }).then(() => setUser(null));
  };

  if (!user) {
    return (
      <main className="app-landing-bg">
        <section className="login-card">
          <div className="logo-circle">
            <img src="/logo192.png" alt="GmailGenius Logo" className="logo-img" />
          </div>
          <h1 className="title">GmailGenius</h1>
          <p className="subtitle">Unlock the power of your Gmail inbox</p>
          <button onClick={googleLogin} className="google-btn">
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="G" style={{ width: 20, marginRight: 10 }} />
            Sign in with Google
          </button>
        </section>
        <style>{`
          .app-landing-bg {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%);
          }
          .login-card {
            background: rgba(255,255,255,0.95);
            border-radius: 20px;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.12);
            padding: 2.5rem 2.5rem 2rem 2.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 320px;
            max-width: 90vw;
          }
          .logo-circle {
            background: linear-gradient(135deg, #818cf8 0%, #a5b4fc 100%);
            border-radius: 50%;
            width: 64px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.2rem;
            box-shadow: 0 2px 8px rgba(129, 140, 248, 0.15);
          }
          .logo-img {
            width: 40px;
            height: 40px;
          }
          .title {
            font-family: 'Inter', sans-serif;
            font-size: 2.2rem;
            font-weight: 700;
            color: #3730a3;
            margin: 0 0 0.5rem 0;
            letter-spacing: -1px;
          }
          .subtitle {
            font-size: 1.1rem;
            color: #6366f1;
            margin-bottom: 2rem;
            font-family: 'Inter', sans-serif;
            text-align: center;
            max-width: 300px;
          }
          .google-btn {
            display: flex;
            align-items: center;
            background: linear-gradient(90deg, #6366f1 0%, #818cf8 100%);
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
            transition: background 0.2s, box-shadow 0.2s;
            margin-top: 0.5rem;
          }
          .google-btn:hover {
            background: linear-gradient(90deg, #818cf8 0%, #6366f1 100%);
            box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
          }
        `}</style>
      </main>
    );
  }

  // ✅ Use Dashboard instead of Email now
  return (
    <Dashboard
      user={user}
      emails={filteredEmails}
      onLogout={logout}
    />
  );
}