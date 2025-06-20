import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ChatAssistant from './ChatAssistant';

export default function SuggestionPanel({ selectedEmail, skills = [] }) {
  const [emailType, setEmailType] = useState(null);
  const [isOpportunity, setIsOpportunity] = useState(false);

  const emailContent = useMemo(() => 
    selectedEmail ? `${selectedEmail.subject || ''} ${selectedEmail.snippet || ''}` : '',
    [selectedEmail]
  );

  const determineEmailType = useCallback((content) => {
    if (!content) return null;
    
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('quiz') || lowerContent.includes('challenge') || 
        lowerContent.includes('test') || lowerContent.includes('assessment') || 
        lowerContent.includes('exam')) {
      return 'assessment';
    }
    if (lowerContent.includes('job') || lowerContent.includes('position') || 
        lowerContent.includes('career') || lowerContent.includes('hiring')) {
      return 'job';
    }
    if (lowerContent.includes('internship') || lowerContent.includes('intern')) {
      return 'internship';
    }
    if (lowerContent.includes('hackathon') || lowerContent.includes('competition') || 
        lowerContent.includes('contest')) {
      return 'competition';
    }
    return null;
  }, []);

  const checkIfOpportunity = useCallback((content) => {
    if (!content) return false;
    
    const opportunityKeywords = [
      'registration', 'apply', 'opportunity', 'position', 'opening',
      'vacancy', 'job', 'career', 'role', 'hiring', 'recruitment'
    ];
    return opportunityKeywords.some(keyword => content.toLowerCase().includes(keyword));
  }, []);

  useEffect(() => {
    if (!emailContent) {
      setEmailType(null);
      setIsOpportunity(false);
      return;
    }

    // Batch the state updates together
    const type = determineEmailType(emailContent);
    const isOpp = checkIfOpportunity(emailContent);

    // Only update if the values have changed
    setEmailType(prev => prev === type ? prev : type);
    setIsOpportunity(prev => prev === isOpp ? prev : isOpp);
  }, [emailContent]);

  const suggestions = useMemo(() => {
    if (!emailType) return [];
    
    const suggestionMap = {
      assessment: [
        "📝 This is an assessment/quiz opportunity",
        "🎯 Taking assessments can help validate your skills",
        "💡 Practice tests can improve your interview readiness"
      ],
      job: [
        "💼 This is a job opportunity",
        "🎯 Consider if this role aligns with your career goals",
        "💡 Research the company before applying"
      ],
      internship: [
        "🎓 This is an internship opportunity",
        "🌱 Great for gaining practical experience",
        "💼 Could lead to full-time opportunities"
      ],
      competition: [
        "🏆 This is a competition/hackathon",
        "💪 Great opportunity to showcase skills",
        "🤝 Network with other participants"
      ]
    };
    
    return suggestionMap[emailType] || [];
  }, [emailType]);

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

  return (
    <div className="suggestion-panel">
      <h3>✨ Email Analysis</h3>
      
      <div className="email-preview">
        <div className="email-type">
          {emailType && (
            <span className="type-badge">
              {emailType === 'assessment' && '📝 Assessment/Quiz'}
              {emailType === 'job' && '💼 Job Opportunity'}
              {emailType === 'internship' && '🎓 Internship'}
              {emailType === 'competition' && '🏆 Competition'}
            </span>
          )}
          {isOpportunity && <span className="opportunity-badge">🎯 Opportunity</span>}
        </div>
        <h4>{selectedEmail.subject || 'No Subject'}</h4>
        <p className="snippet">{selectedEmail.snippet || 'No preview available'}</p>
      </div>

      <div className="chat-section">
        <ChatAssistant
          email={selectedEmail}
          skills={skills}
          initialSuggestions={suggestions}
        />
      </div>

      <style jsx="true">{`
        .suggestion-panel {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        h3 {
          margin: 0;
          color: #1a1a1a;
          font-family: 'Inter', sans-serif;
        }

        h4 {
          margin: 0.5rem 0;
          color: #374151;
          font-family: 'Inter', sans-serif;
        }

        .email-preview {
          padding: 1.25rem;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .email-type {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .type-badge,
        .opportunity-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
        }

        .type-badge {
          background: #818cf8;
          color: white;
        }

        .opportunity-badge {
          background: #34d399;
          color: white;
        }

        .snippet {
          color: #6b7280;
          font-size: 0.875rem;
          line-height: 1.6;
          margin: 0;
          font-family: 'Inter', sans-serif;
        }

        .chat-section {
          flex: 1;
          min-height: 300px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}