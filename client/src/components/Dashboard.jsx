import React from 'react';

export default function EmailDashboard({ user, emails, onLogout }) {
  return (
    <main className="dashboard">
      <div className="user-info">
        <img src={user.picture} alt="Profile" className="avatar" />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <button onClick={onLogout}>Logout</button>
      </div>

      <section className="email-list">
        <h3>📬 Recent Emails</h3>
        {emails.length === 0 ? (
          <p>No emails to display.</p>
        ) : (
          <ul>
            {emails.slice(0, 10).map((email, index) => (
              <li key={index} className="email-card">
                <strong>{email.subject || '(No Subject)'}</strong>
                <p>{email.snippet}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <style>{`
        .dashboard {
          padding: 2rem;
          max-width: 700px;
          margin: auto;
          font-family: 'Segoe UI', sans-serif;
        }
        .user-info {
          text-align: center;
          margin-bottom: 2rem;
        }
        .avatar {
          width: 100px;
          border-radius: 50%;
          margin-bottom: 1rem;
        }
        .email-list ul {
          list-style: none;
          padding: 0;
        }
        .email-card {
          background: #f1f3f4;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
      `}</style>
    </main>
  );
}


