import React from 'react';
import { generateEmailTags } from '../utils/tagUtils';

const EmailTags = ({ email }) => {
  const tags = generateEmailTags(email);

  if (tags.length === 0) return null;

  return (
    <div className="email-tags">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="tag"
          style={{
            backgroundColor: `${tag.color}15`,
            color: tag.color,
          }}
        >
          {tag.label}
        </span>
      ))}

      <style jsx="true">{`
        .email-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .tag {
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};

export default EmailTags;
