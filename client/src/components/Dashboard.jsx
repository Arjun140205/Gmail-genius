import React from 'react';
import EmailCard from '../components/EmailCard';

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
          <div className="email-grid">
            {emails.slice(0, 10).map((email, index) => (
              <EmailCard key={index} subject={email.subject} snippet={email.snippet} />
            ))}
          </div>
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
        .email-list {
          margin-top: 1rem;
        }
        .email-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
      `}</style>
    </main>
  );
}
