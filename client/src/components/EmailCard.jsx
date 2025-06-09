// src/components/EmailCard.jsx
import React from 'react';

function highlight(text, keyword) {
  if (!keyword) return text;
  const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <mark key={i}>{part}</mark>
    ) : (
      part
    )
  );
}

const EmailCard = ({ email, searchTerm, onClick }) => {
  const { subject, snippet, internalDate } = email;

  const formattedDate = internalDate
    ? new Date(Number(internalDate)).toLocaleString()
    : '';

  return (
    <div className="email-card" onClick={onClick}>
      <h4 className="email-subject">
        {highlight(subject || '(No Subject)', searchTerm)}
      </h4>
      <p className="email-snippet">{highlight(snippet || '', searchTerm)}</p>
      <p className="email-date">{formattedDate}</p>

      <style jsx>{`
        .email-card {
          background: #ffffff;
          border: 1px solid #e0e0e0;
          padding: 1rem;
          border-radius: 10px;
          margin-bottom: 1rem;
          cursor: pointer;
          transition: box-shadow 0.2s;
        }

        .email-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .email-subject {
          font-weight: 600;
          font-size: 1.05rem;
          color: #202124;
          margin-bottom: 0.4rem;
        }

        .email-snippet {
          color: #5f6368;
          font-size: 0.95rem;
          margin-bottom: 0.3rem;
        }

        .email-date {
          color: #999;
          font-size: 0.8rem;
          text-align: right;
        }

        mark {
          background-color: yellow;
        }
      `}</style>
    </div>
  );
};

export default EmailCard;
