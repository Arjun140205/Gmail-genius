import React from 'react';

export default function SuggestionPanel({ emails, skills }) {
  const threshold = 2; // number of skills matched to trigger suggestion

  const getSuggestions = () => {
    return emails
      .map(email => {
        const text = `${email.subject} ${email.snippet}`.toLowerCase();
        const matched = skills.filter(skill => text.includes(skill.toLowerCase()));
        return { ...email, matchedSkills: matched, score: matched.length };
      })
      .filter(email => email.score >= threshold)
      .sort((a, b) => b.score - a.score) // highest skill match first
      .slice(0, 5); // limit to top 5
  };

  const suggestions = getSuggestions();

  if (suggestions.length === 0) return null;

  return (
    <section className="suggestions">
      <h3>🧠 Smart Suggestions Based on Your Resume</h3>
      {suggestions.map((email, index) => (
        <div key={index} className="suggestion-card">
          <h4>{email.subject || 'No Subject'}</h4>
          <p>{email.snippet}</p>
          <p className="highlight">Matched Skills: {email.matchedSkills.join(', ')}</p>
        </div>
      ))}

      <style>{`
        .suggestions {
          margin-top: 2rem;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          background: #fdfdfd;
        }
        .suggestion-card {
          margin-bottom: 1rem;
          padding: 0.75rem;
          border: 1px solid #e5e5e5;
          border-radius: 6px;
          background: #fff;
        }
        .suggestion-card h4 {
          font-size: 1.1rem;
          font-weight: 600;
        }
        .highlight {
          margin-top: 0.5rem;
          font-size: 0.9rem;
          color: #2563eb;
        }
      `}</style>
    </section>
  );
}