import React, { useState, useEffect } from 'react';

export default function App() {
  const [user, setUser] = useState(null);
  const [emails, setEmails] = useState([]);

  // Fetch logged-in user info on app load
  useEffect(() => {
    fetch('http://localhost:3500/auth/user', {
      credentials: 'include',
    })
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
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, []);

  // Fetch emails after user is set
  useEffect(() => {
    if (user) {
      fetch('http://localhost:3500/api/gmail/emails', {
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          if (data.emails) {
            // Initialize emails without tags
            setEmails(data.emails.map(email => ({ ...email, tag: '' })));
          }
        });
    }
  }, [user]);

  const googleLogin = () => {
    window.location.href = 'http://localhost:3500/auth/google';
  };

  const logout = () => {
    fetch('http://localhost:3500/auth/logout', {
      method: 'GET',
      credentials: 'include',
    })
      .then(() => setUser(null))
      .catch(err => {
        console.error('Logout error:', err);
        setUser(null);
      });
  };

  // Handle tag change per email
  const handleTagChange = (index, tag) => {
    const updatedEmails = [...emails];
    updatedEmails[index].tag = tag;
    setEmails(updatedEmails);
  };

  if (!user) {
    return (
      <main className="app-container">
        <section className="login-card">
          <h1 className="title">GmailGenius</h1>
          <p className="subtitle">Unlock the power of your Gmail inbox</p>
          <button onClick={googleLogin} className="google-btn" aria-label="Login with Google">
            <svg
              className="google-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 533.5 544.3"
              aria-hidden="true"
            >
              <path
                fill="#4285f4"
                d="M533.5 278.4c0-17.7-1.6-34.8-4.6-51.4H272v97.3h146.9c-6.3 34-25 62.9-53.6 82.3v68h86.7c50.7-46.7 80.5-115.4 80.5-196.2z"
              />
              <path
                fill="#34a853"
                d="M272 544.3c72.8 0 134-24.1 178.7-65.5l-86.7-68c-24.1 16.2-55 25.8-92 25.8-70.6 0-130.5-47.6-152-111.6H32v69.9C76.6 481.5 168.7 544.3 272 544.3z"
              />
              <path
                fill="#fbbc04"
                d="M120 321.1c-11.7-35-11.7-72.7 0-107.7V143.5H32c-41.5 82.9-41.5 181.3 0 264.2l88-69.9z"
              />
              <path
                fill="#ea4335"
                d="M272 107.6c39.5 0 75 13.6 102.9 40.4l77.1-77.1C402 24.7 345 0 272 0 168.7 0 76.6 62.8 32 157.6l88 69.9c21.5-64 81.4-111.6 152-111.6z"
              />
            </svg>
            Sign in with Google
          </button>
        </section>

        <style>{`
          * {
            box-sizing: border-box;
          }
          body, html, #root {
            margin: 0;
            height: 100%;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f7fa;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .app-container {
            width: 100%;
            max-width: 420px;
            padding: 2rem;
          }
          .login-card {
            background: white;
            padding: 3rem 2rem;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.1);
            text-align: center;
          }
          .title {
            font-size: 2.8rem;
            margin-bottom: 0.5rem;
            color: #202124;
            font-weight: 700;
          }
          .subtitle {
            font-size: 1.2rem;
            color: #5f6368;
            margin-bottom: 2rem;
          }
          .google-btn {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            background: #fff;
            border: 1.5px solid #dfe1e5;
            padding: 0.75rem 1.5rem;
            font-size: 1.1rem;
            color: #3c4043;
            font-weight: 600;
            border-radius: 6px;
            cursor: pointer;
            transition: background-color 0.3s ease, box-shadow 0.3s ease;
            user-select: none;
            box-shadow: 0 2px 4px rgb(0 0 0 / 0.1);
          }
          .google-btn:hover {
            background-color: #f8f8f8;
            box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
          }
          .google-icon {
            width: 24px;
            height: 24px;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: '600px',
        margin: '2rem auto',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        textAlign: 'center',
        padding: '1rem',
      }}
    >
      <h1 style={{ fontSize: '2rem' }}>Welcome, {user.name}!</h1>
      {user.picture && (
        <img
          src={user.picture}
          alt="Profile"
          style={{ borderRadius: '50%', width: '120px', margin: '1rem auto' }}
        />
      )}
      <p style={{ color: '#555', fontWeight: 500 }}>{user.email}</p>

      <h2 style={{ marginTop: '2.5rem' }}>📬 Recent Emails</h2>
      {emails.length === 0 ? (
        <p style={{ color: '#999', marginTop: '1rem' }}>No emails to display.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {emails.map((email, index) => (
            <li
              key={email.id || index}
              style={{
                background: '#fff',
                margin: '1rem 0',
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                textAlign: 'left',
              }}
            >
              <strong>Subject:</strong> {email.subject || '(No Subject)'}
              <p style={{ marginTop: '0.5rem', color: '#555' }}>{email.snippet}</p>

              {/* Tag display */}
              {email.tag && (
                <span
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#4285f4',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    marginTop: '0.5rem',
                  }}
                >
                  {email.tag}
                </span>
              )}

              {/* Tagging dropdown */}
              <div style={{ marginTop: '0.5rem' }}>
                <label htmlFor={`tag-${index}`}>Tag this email:</label>
                <select
                  id={`tag-${index}`}
                  onChange={(e) => handleTagChange(index, e.target.value)}
                  defaultValue=""
                  style={{ marginLeft: '0.5rem', padding: '4px' }}
                >
                  <option value="" disabled>
                    Select tag
                  </option>
                  <option value="Job">Job</option>
                  <option value="Important">Important</option>
                  <option value="Follow Up">Follow Up</option>
                </select>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={logout}
        style={{
          marginTop: '2rem',
          backgroundColor: '#ea4335',
          color: 'white',
          border: 'none',
          padding: '0.6rem 1.2rem',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '600',
        }}
      >
        Logout
      </button>
    </main>
  );
}
