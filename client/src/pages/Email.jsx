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
    <div className="email-dashboard">
      <aside className="sidebar">
        <div className="user-profile">
          <img src={user.picture} alt="Profile" className="user-avatar" />
          <div className="user-info">
            <h3 className="user-name">{user.name}</h3>
            <p className="user-email">{user.email}</p>
          </div>
          <button onClick={onLogout} className="logout-button">
            Sign Out
          </button>
        </div>

        <nav className="tag-navigation">
          <h4 className="nav-title">Filter by Tags</h4>
          <ul className="tag-list">
            {tags.map((tag) => (
              <li key={tag}>
                <button
                  className={'tag-button ' + (selectedTag === tag ? 'active' : '')}
                  onClick={() => setSelectedTag(tag)}
                >
                  <span>
                    {tag === 'All' ? '📥' : 
                     tag === 'Job' ? '💼' : 
                     tag === 'Internship' ? '🎓' : 
                     tag === 'Opportunity' ? '🌟' : '📨'}
                  </span>
                  {tag}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="email-content">
        <header className="content-header">
          <div className="search-bar">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16z" />
              <path d="M19 19l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </header>

        <section className="emails-section">
          <div className="section-header">
            <h2 className="section-title">{selectedTag} Emails</h2>
            <span className="email-count">{filteredEmails.length} emails</span>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading your emails...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <span>❌</span>
              <p>{error}</p>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="empty-state">
              <span>📭</span>
              <p>No emails match your criteria</p>
            </div>
          ) : (
            <div className="email-list">
              {filteredEmails.map((email) => (
                <EmailCard
                  key={email.id}
                  email={email}
                  searchTerm={searchTerm}
                  onClick={() => setSelectedEmail(email)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {selectedEmail && (
        <EmailModal
          email={selectedEmail}
          searchTerm={searchTerm}
          onClose={() => setSelectedEmail(null)}
        />
      )}

      <style jsx>{`
        .email-dashboard {
          display: flex;
          height: 100vh;
          background: #f8fafc;
        }

        .sidebar {
          width: 280px;
          background: white;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          height: 100vh;
          position: sticky;
          top: 0;
        }

        .user-profile {
          text-align: center;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 1.5rem;
        }

        .user-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin-bottom: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .user-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.25rem;
        }

        .user-email {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0 0 1rem;
        }

        .logout-button {
          background: #f1f5f9;
          color: #475569;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .logout-button:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .nav-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #64748b;
          margin: 0 0 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .tag-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .tag-button {
          width: 100%;
          text-align: left;
          padding: 0.75rem 1rem;
          border: none;
          background: transparent;
          color: #475569;
          font-size: 0.95rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .tag-button:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        .tag-button.active {
          background: #e0f2fe;
          color: #0284c7;
          font-weight: 500;
        }

        .email-content {
          flex: 1;
          min-width: 0;
          padding: 2rem;
          overflow-y: auto;
          max-width: 900px;
          margin: 0 auto;
        }

        .content-header {
          position: sticky;
          top: 0;
          background: #f8fafc;
          padding: 1rem 0;
          margin-bottom: 2rem;
          z-index: 10;
        }

        .search-bar {
          position: relative;
          max-width: 600px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .search-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 2.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.95rem;
          color: #1e293b;
          background: white;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #93c5fd;
          box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.25);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .email-count {
          font-size: 0.875rem;
          color: #64748b;
          background: #f1f5f9;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
        }

        .loading-state,
        .error-state,
        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: #64748b;
        }

        .loading-spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-state span,
        .empty-state span {
          font-size: 2rem;
          margin-bottom: 1rem;
          display: block;
        }

        @media (max-width: 768px) {
          .email-dashboard {
            flex-direction: column;
          }

          .sidebar {
            width: 100%;
            height: auto;
            position: static;
            padding: 1rem;
          }

          .email-content {
            padding: 1rem;
          }

          .content-header {
            position: static;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}
