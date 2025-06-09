// src/pages/Email.jsx
import React from 'react';
import EmailCard from '../components/EmailCard';
import '../styles/email.css'; // Optional: for extra styling

export default function Email({ user, emails, onLogout, loading, error }) {
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
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : emails.length === 0 ? (
          <p>No emails to display.</p>
        ) : (
          <ul>
            {emails.map((email) => (
              <EmailCard key={email.id} email={email} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
