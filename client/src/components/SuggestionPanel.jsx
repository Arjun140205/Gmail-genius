import React from 'react';

export default function SuggestionPanel({ selectedEmail, skills = [] }) {
  if (!selectedEmail) {
    return (
      <div className="suggestion-panel">
        <h3>✨ Email Analysis</h3>
        <p className="no-email">Select an email to see suggestions</p>
        <style jsx="true">{`
          .suggestion-panel {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .no-email {
            color: #666;
            text-align: center;
            padding: 2rem 0;
          }
        `}</style>
      </div>
    );
  }

  const analyzeEmail = () => {
    if (!skills || skills.length === 0) {
      return {
        matchedSkills: [],
        suggestions: ['Upload your resume to get personalized suggestions'],
        score: 0
      };
    }

    const text = `${selectedEmail.subject || ''} ${selectedEmail.snippet || ''}`.toLowerCase();
    const matchedSkills = skills.filter(skill => 
      typeof skill === 'string' && text.includes(skill.toLowerCase())
    );

    let suggestions = [];

    // Add suggestions based on content analysis
    if (selectedEmail.subject?.length < 20) {
      suggestions.push('Consider writing a more detailed subject line');
    }

    if (matchedSkills.length > 0) {
      suggestions.push(`This email matches your skills in: ${matchedSkills.join(', ')}`);
    } else {
      suggestions.push('This email doesn\'t match your listed skills');
    }

    return {
      matchedSkills,
      suggestions,
      score: matchedSkills.length
    };
  };

  const analysis = analyzeEmail();

  return (
    <div className="suggestion-panel">
      <h3>✨ Email Analysis</h3>
      
      <div className="email-preview">
        <h4>{selectedEmail.subject || 'No Subject'}</h4>
        <p className="snippet">{selectedEmail.snippet || 'No preview available'}</p>
      </div>

      {analysis.matchedSkills.length > 0 && (
        <div className="matched-skills">
          <h4>Matched Skills</h4>
          <div className="skills-tags">
            {analysis.matchedSkills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="suggestions-list">
        <h4>Suggestions</h4>
        <ul>
          {analysis.suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      </div>

      <style jsx="true">{`
        .suggestion-panel {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        h3 {
          margin: 0 0 1.5rem 0;
          color: #1a1a1a;
        }

        h4 {
          margin: 1rem 0 0.5rem 0;
          color: #374151;
        }

        .email-preview {
          padding: 1rem;
          background: #f9fafb;
          border-radius: 6px;
          margin-bottom: 1.5rem;
        }

        .snippet {
          color: #6b7280;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .matched-skills {
          margin: 1.5rem 0;
        }

        .skills-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-tag {
          background: #e0e7ff;
          color: #4338ca;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .suggestions-list ul {
          list-style-type: none;
          padding: 0;
          margin: 0;
        }

        .suggestions-list li {
          padding: 0.75rem;
          background: #f3f4f6;
          border-radius: 4px;
          margin-bottom: 0.5rem;
          color: #374151;
          font-size: 0.875rem;
        }

        .suggestions-list li:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}