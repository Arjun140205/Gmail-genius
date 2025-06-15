import React, { useState } from 'react';
import EmailCard from '../components/EmailCard';
import ResumeUpload from '../components/ResumeUpload';

export default function EmailDashboard({ user, emails = [], onLogout }) {
  const [extractedSkills, setExtractedSkills] = useState([]);
  const profileImage = user?.picture || '/api/user/profile-image';
  const userName = user?.name || 'User';
  const userEmail = user?.email || '';

  const handleSkillsExtracted = (skills) => {
    setExtractedSkills(skills);
    // You might want to trigger email matching here with the extracted skills
  };

  return (
    <main className="dashboard">
      <div className="user-info">
        <img 
          src={profileImage} 
          alt="Profile" 
          className="avatar"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `data:image/svg+xml,${encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <text x="50%" y="50%" font-family="Arial" font-size="12" fill="#6B7280" text-anchor="middle" dy=".3em">
                  ${userName[0]}
                </text>
              </svg>`
            )}`;
          }}
        />
        <h2>{userName}</h2>
        <p>{userEmail}</p>
        <button 
          onClick={onLogout}
          className="logout-button"
        >
          Logout
        </button>
      </div>

      <ResumeUpload onSkillsExtracted={handleSkillsExtracted} />

      <section className="email-list">
        <h3>📬 Recent Emails</h3>
        {extractedSkills.length > 0 && (
          <div className="skills-section">
            <h4>Extracted Skills:</h4>
            <div className="skills-tags">
              {extractedSkills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        {!Array.isArray(emails) || emails.length === 0 ? (
          <p className="no-emails">No emails to display.</p>
        ) : (
          <div className="email-grid">
            {emails.slice(0, 10).map((email, index) => (
              <EmailCard
                key={email?.id || index}
                subject={email?.subject || 'No Subject'}
                snippet={email?.snippet || 'No preview available'}
              />
            ))}
          </div>
        )}
      </section>

      <style jsx="true">{`
        .dashboard {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .user-info {
          text-align: center;
          margin-bottom: 2rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 40px;
          margin-bottom: 1rem;
        }

        .email-list {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .skills-section {
          margin: 1rem 0;
          padding: 1rem;
          background: #f7f7f7;
          border-radius: 6px;
        }

        .skills-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .skill-tag {
          background: #e0e7ff;
          color: #4338ca;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .email-grid {
          display: grid;
          gap: 1rem;
          margin-top: 1rem;
        }

        .no-emails {
          text-align: center;
          color: #666;
          padding: 2rem;
        }

        .logout-button {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .logout-button:hover {
          background: #dc2626;
        }

        @media (min-width: 640px) {
          .email-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </main>
  );
}
