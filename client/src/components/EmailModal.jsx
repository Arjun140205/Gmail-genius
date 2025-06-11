// src/components/EmailModal.jsx
import React, { useEffect } from 'react';

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

const EmailModal = ({ email, searchTerm, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        
        <div className="modal-header">
          <div className="email-avatar">📧</div>
          <div className="email-info">
            <h3 className="email-title">{highlight(email.subject || '(No Subject)', searchTerm)}</h3>
            <p className="email-date">
              {new Date(Number(email.internalDate)).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        <div className="email-content">
          <p className="email-body">{highlight(email.snippet || 'No preview available', searchTerm)}</p>
        </div>
      </div>

      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          background: white;
          width: 90%;
          max-width: 700px;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          position: relative;
          animation: slideUp 0.3s ease-out;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
        }

        .close-btn {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #f1f5f9;
          color: #334155;
          transform: scale(1.1);
        }

        .modal-header {
          padding: 2rem 2rem 1.5rem;
          display: flex;
          gap: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .email-avatar {
          background: #f8fafc;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .email-info {
          flex: 1;
          padding-right: 2rem;
        }

        .email-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.5rem;
          line-height: 1.3;
        }

        .email-date {
          color: #64748b;
          font-size: 0.875rem;
          margin: 0;
        }

        .email-content {
          padding: 2rem;
          overflow-y: auto;
        }

        .email-body {
          color: #334155;
          line-height: 1.6;
          font-size: 1rem;
          margin: 0;
          white-space: pre-line;
        }

        mark {
          background-color: #fef9c3;
          padding: 0.1em 0.2em;
          border-radius: 2px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 640px) {
          .modal-content {
            width: 95%;
            max-height: 90vh;
          }

          .modal-header {
            padding: 1.5rem 1.5rem 1rem;
          }

          .email-content {
            padding: 1.5rem;
          }

          .email-title {
            font-size: 1.25rem;
          }

          .close-btn {
            top: 1rem;
            right: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EmailModal;
