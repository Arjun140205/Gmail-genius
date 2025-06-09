// src/components/EmailModal.jsx
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

const EmailModal = ({ email, searchTerm, onClose }) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <h3>{highlight(email.subject || '(No Subject)', searchTerm)}</h3>
        <p>{highlight(email.snippet || 'No preview available', searchTerm)}</p>
        <p style={{ fontSize: '0.9rem', marginTop: '1rem', color: '#888' }}>
          Received on: {new Date(email.internalDate * 1).toLocaleString()}
        </p>
      </div>
      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
          position: relative;
        }
        .close-btn {
          position: absolute;
          top: 10px; right: 10px;
          font-size: 1.5rem;
          border: none;
          background: transparent;
          cursor: pointer;
        }
        mark {
          background-color: yellow;
        }
      `}</style>
    </div>
  );
};

export default EmailModal;
