import React, { useState } from 'react';
import EmailCard from './EmailCard';
import ResumeUpload from './ResumeUpload';
import AnalyticsPanel from './AnalyticsPanel';
import SuggestionPanel from './SuggestionPanel';
import SuggestedMatches from './SuggestedMatches';
import TagFilter from './TagFilter';
import { filterEmailsByTags } from '../utils/tagUtils';

export default function EmailDashboard({ user, emails = [], onLogout }) {
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const profileImage = user?.picture || '/api/user/profile-image';
  const userName = user?.name || 'User';
  const userEmail = user?.email || '';

  const handleSkillsExtracted = (skills) => {
    setExtractedSkills(skills);
  };

  const handleEmailSelect = (email) => {
    setSelectedEmail(email);
  };

  const filteredEmails = filterEmailsByTags(emails, selectedTags);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="brand-title">GmailGenius</h1>
          <div className="user-section">
            <div className="user-info">
              <img 
                src={profileImage} 
                alt={userName}
                className="avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `data:image/svg+xml,${encodeURIComponent(
                    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <text x="50%" y="50%" font-family="Inter" font-size="12" fill="#6B7280" text-anchor="middle" dy=".3em">
                        ${userName[0]}
                      </text>
                    </svg>`
                  )}`;
                }}
              />
              <div className="user-details">
                <span className="user-name">{userName}</span>
                <span className="user-email">{userEmail}</span>
              </div>
            </div>
            <button onClick={onLogout} className="logout-button">
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="left-column">
          <TagFilter 
            selectedTags={selectedTags}
            onTagSelect={setSelectedTags}
          />
          <ResumeUpload onSkillsExtracted={handleSkillsExtracted} />
          <AnalyticsPanel emails={emails} skills={extractedSkills} />
        </div>

        <div className="middle-column">
          <section className="email-section">
            <div className="section-header">
              <h2 className="section-title">📬 Recent Emails</h2>
              {selectedTags.length > 0 && (
                <span className="filter-info">
                  Showing {filteredEmails.length} filtered results
                </span>
              )}
            </div>

            {extractedSkills.length > 0 && (
              <div className="skills-section">
                <h3 className="skills-title">Your Skills</h3>
                <div className="skills-tags">
                  {extractedSkills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {!Array.isArray(filteredEmails) || filteredEmails.length === 0 ? (
              <div className="no-emails">
                {selectedTags.length > 0 ? (
                  <p>No emails match the selected filters</p>
                ) : (
                  <p>No emails to display</p>
                )}
              </div>
            ) : (
              <div className="email-grid">
                {filteredEmails.slice(0, 10).map((email, index) => (
                  <EmailCard
                    key={email?.id || index}
                    subject={email?.subject || 'No Subject'}
                    snippet={email?.snippet || 'No preview available'}
                    onClick={() => handleEmailSelect(email)}
                    isSelected={selectedEmail?.id === email?.id}
                    skills={extractedSkills}
                  />
                ))}
              </div>
            )}
          </section>

          {extractedSkills.length > 0 && (
            <SuggestedMatches 
              skills={extractedSkills}
              emails={emails}
            />
          )}
        </div>

        <div className="right-column">
          <SuggestionPanel 
            selectedEmail={selectedEmail}
            skills={extractedSkills}
          />
        </div>
      </div>

      <style jsx="true">{`
        .dashboard-container {
          min-height: 100vh;
          background: #f3f4f6;
        }

        .dashboard-header {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 10;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .header-content {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .brand-title {
          font-family: 'Poppins', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .user-name {
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          color: #1f2937;
        }

        .user-email {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 300px 1fr 300px;
          gap: 2rem;
          max-width: 1600px;
          margin: 2rem auto;
          padding: 0 2rem;
        }

        .section-title {
          font-family: 'Inter', sans-serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 1.5rem 0;
        }

        .skills-section {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .skills-title {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 1rem 0;
        }

        .skills-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-tag {
          background: #e0e7ff;
          color: #4338ca;
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .email-section {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .email-grid {
          display: grid;
          gap: 1rem;
        }

        .no-emails {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
          font-family: 'Inter', sans-serif;
        }

        .logout-button {
          padding: 0.5rem 1rem;
          background: transparent;
          color: #4f46e5;
          border: 1px solid #4f46e5;
          border-radius: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .logout-button:hover {
          background: #4f46e5;
          color: white;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .filter-info {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          color: #6B7280;
        }

        @media (max-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .right-column {
            order: 2;
          }

          .middle-column {
            order: 1;
          }

          .left-column {
            order: 0;
          }
        }

        @media (max-width: 640px) {
          .header-content {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .user-section {
            flex-direction: column;
          }

          .dashboard-grid {
            padding: 1rem;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
