// src/components/EmailCard.jsx
import React from 'react';

// Keywords and corresponding tags
const TAG_RULES = [
  { tag: 'Internship', keywords: ['internship', 'intern'] },
  { tag: 'Job', keywords: ['job', 'hiring', 'recruitment'] },
  { tag: 'Offer', keywords: ['offer', 'selected', 'congratulations'] },
  { tag: 'Interview', keywords: ['interview', 'shortlisted', 'call'] },
  { tag: 'Alert', keywords: ['alert', 'warning', 'notice'] },
];

// Highlighting
const highlightText = (text) => {
  if (!text) return '';
  const allKeywords = TAG_RULES.flatMap(rule => rule.keywords);
  const regex = new RegExp(`\\b(${allKeywords.join('|')})\\b`, 'gi');
  return text.replace(regex, (match) => `<mark>${match}</mark>`);
};

// Tag detection
const detectTags = (text) => {
  const tags = [];
  const lowerText = text?.toLowerCase() || '';
  TAG_RULES.forEach(rule => {
    if (rule.keywords.some(keyword => lowerText.includes(keyword))) {
      tags.push(rule.tag);
    }
  });
  return [...new Set(tags)];
};

const EmailCard = ({ subject, snippet }) => {
  const tags = detectTags(`${subject} ${snippet}`);

  return (
    <div className="email-card">
      <div className="email-tags">
        {tags.map((tag, index) => (
          <span className="tag" key={index}>{tag}</span>
        ))}
      </div>

      <h4
        className="email-subject"
        dangerouslySetInnerHTML={{ __html: highlightText(subject || '(No Subject)') }}
      ></h4>
      <p
        className="email-snippet"
        dangerouslySetInnerHTML={{ __html: highlightText(snippet) }}
      ></p>

      <style jsx>{`
        .email-card {
          background: #ffffff;
          border: 1px solid #e0e0e0;
          padding: 1rem;
          border-radius: 10px;
          margin-bottom: 1rem;
          transition: box-shadow 0.2s;
        }

        .email-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .email-tags {
          margin-bottom: 0.5rem;
        }

        .tag {
          display: inline-block;
          background-color: #e8f0fe;
          color: #1967d2;
          padding: 0.25rem 0.6rem;
          margin-right: 0.4rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .email-subject {
          font-weight: 600;
          font-size: 1.05rem;
          color: #202124;
          margin-bottom: 0.5rem;
        }

        .email-snippet {
          color: #5f6368;
          font-size: 0.95rem;
        }

        mark {
          background-color: #fff176;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default EmailCard;
