import React, { useState, useEffect } from 'react';
import EmailCard from './EmailCard';

const SavedEmails = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSavedEmails();
  }, []);

  const fetchSavedEmails = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/saved-emails', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch saved emails');
      }
      const data = await response.json();
      setEmails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveEmail = async (emailId) => {
    try {
      await fetch(`/api/saved-emails/${emailId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      // Remove the email from the list
      setEmails(emails.filter(email => email.emailId !== emailId));
    } catch (err) {
      console.error('Error unsaving email:', err);
    }
  };

  if (loading) {
    return (
      <div className="saved-emails-loading">
        <div className="loading-state">
          <span className="icon">⌛</span>
          <p>Loading saved emails...</p>
        </div>
        <style jsx="true">{`
          .saved-emails-loading {
            background: white;
            padding: 3rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            text-align: center;
          }
          .loading-state {
            max-width: 300px;
            margin: 0 auto;
          }
          .icon {
            font-size: 2rem;
            margin-bottom: 1rem;
            display: block;
          }
          p {
            font-family: 'Inter', sans-serif;
            font-size: 0.875rem;
            color: #6b7280;
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="saved-emails-error">
        <div className="error-state">
          <span className="icon">⚠️</span>
          <h3>Error Loading Emails</h3>
          <p>{error}</p>
        </div>
        <style jsx="true">{`
          .saved-emails-error {
            background: white;
            padding: 3rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            text-align: center;
          }
          .error-state {
            max-width: 300px;
            margin: 0 auto;
          }
          .icon {
            font-size: 2rem;
            margin-bottom: 1rem;
            display: block;
            color: #ef4444;
          }
          h3 {
            font-family: 'Inter', sans-serif;
            font-size: 1.25rem;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 0.5rem 0;
          }
          p {
            font-family: 'Inter', sans-serif;
            font-size: 0.875rem;
            color: #6b7280;
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  if (!emails || emails.length === 0) {
    return (
      <div className="saved-emails-empty">
        <div className="empty-state">
          <span className="icon">📌</span>
          <h3>No Saved Emails</h3>
          <p>Star important emails to save them for later</p>
        </div>

        <style jsx="true">{`
          .saved-emails-empty {
            background: white;
            padding: 3rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            text-align: center;
          }

          .empty-state {
            max-width: 300px;
            margin: 0 auto;
          }

          .icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            display: block;
          }

          h3 {
            font-family: 'Inter', sans-serif;
            font-size: 1.25rem;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 0.5rem 0;
          }

          p {
            font-family: 'Inter', sans-serif;
            font-size: 0.875rem;
            color: #6b7280;
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="saved-emails">
      <div className="saved-header">
        <h2>📌 Saved Emails</h2>
        <span className="count">{emails.length} saved</span>
      </div>

      <div className="emails-list">
        {emails.map((email) => (
          <EmailCard
            key={email.emailId}
            id={email.emailId}
            subject={email.subject}
            snippet={email.snippet}
            onSave={() => handleUnsaveEmail(email.emailId)}
          />
        ))}
      </div>

      <style jsx="true">{`
        .saved-emails {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .saved-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .saved-header h2 {
          font-family: 'Inter', sans-serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .count {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .emails-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
      `}</style>
    </div>
  );
};

export default SavedEmails;
