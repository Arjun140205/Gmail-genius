// src/pages/Email.jsx
import React, { useState } from 'react';
import EmailCard from '../components/EmailCard';
import EmailModal from '../components/EmailModal';
import '../styles/email.css';

export default function Email({ user, emails, onLogout, loading, error }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedEmail, setSelectedEmail] = useState(null);

  const filterEmails = (email) => {
    const tagMatch =
      selectedTag === 'All' ||
      email.tags?.includes(selectedTag.toLowerCase());
    const keyword = searchTerm.toLowerCase();
    const subjectMatch = email.subject?.toLowerCase().includes(keyword);
    const snippetMatch = email.snippet?.toLowerCase().includes(keyword);
    return tagMatch && (subjectMatch || snippetMatch);
  };

  const filteredEmails = emails.filter(filterEmails);

  const tags = ['All', 'Job', 'Internship', 'Opportunity', 'Offer'];

  return (
    <main className="dashboard">
      <div className="user-info">
        <img src={user.picture} alt="Profile" className="avatar" />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <button onClick={onLogout}>Logout</button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="🔍 Search emails..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)}>
          {tags.map((tag) => (
            <option key={tag}>{tag}</option>
          ))}
        </select>
      </div>

      <section className="email-list">
        <h3>📬 Filtered Emails</h3>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : filteredEmails.length === 0 ? (
          <p>No emails match your criteria.</p>
        ) : (
          <ul>
            {filteredEmails.map((email) => (
              <EmailCard
                key={email.id}
                email={email}
                searchTerm={searchTerm}
                onClick={() => setSelectedEmail(email)}
              />
            ))}
          </ul>
        )}
      </section>

      {selectedEmail && (
        <EmailModal
          email={selectedEmail}
          searchTerm={searchTerm}
          onClose={() => setSelectedEmail(null)}
        />
      )}
    </main>
  );
}
