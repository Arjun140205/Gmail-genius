import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { savedEmailsApi } from '../utils/api';
import { aiApiService } from '../utils/aiApi';
import EmailCard from './EmailCard';
import ResumeUpload from './ResumeUpload';
import AnalyticsPanel from './AnalyticsPanel';
import SuggestionPanel from './SuggestionPanel';
import AISuggestionPanel from './AISuggestionPanel';
import SuggestedMatches from './SuggestedMatches';
import TagFilter from './TagFilter';
import SavedEmails from './SavedEmails';
import { filterEmailsByTags } from '../utils/tagUtils';

export default function EmailDashboard({ user, emails = [], onLogout }) {
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [resumeData, setResumeData] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [activeTab, setActiveTab] = useState('inbox');
  const [savedEmails, setSavedEmails] = useState([]);
  const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState(false);
  const [batchAnalysisStatus, setBatchAnalysisStatus] = useState(null);
  
  const profileImage = useMemo(() => user?.picture || '/api/user/profile-image', [user?.picture]);
  const userName = useMemo(() => user?.name || 'User', [user?.name]);
  const userEmail = useMemo(() => user?.email || '', [user?.email]);

  // Memoize filtered emails to prevent unnecessary recalculations
  const filteredEmails = useMemo(
    () => filterEmailsByTags(emails, selectedTags),
    [emails, selectedTags]
  );

  const fetchSavedEmails = useCallback(async () => {
    try {
      const response = await savedEmailsApi.getSaved();
      setSavedEmails(response.data || []);
    } catch (error) {
      console.error('Error fetching saved emails:', error);
    }
  }, []);

  const handleSaveEmail = useCallback(async (email) => {
    try {
      await savedEmailsApi.saveEmail({
        emailId: email.id,
        subject: email.subject,
        snippet: email.snippet
      });
      fetchSavedEmails();
    } catch (error) {
      console.error('Error saving email:', error);
    }
  }, [fetchSavedEmails]);

  const handleUnsaveEmail = useCallback(async (emailId) => {
    try {
      await savedEmailsApi.unsaveEmail(emailId);
      fetchSavedEmails();
    } catch (error) {
      console.error('Error removing saved email:', error);
    }
  }, [fetchSavedEmails]);

  const handleSkillsExtracted = useCallback((skills, data = null) => {
    setExtractedSkills(prevSkills => {
      // Only update if the skills have actually changed
      if (JSON.stringify(prevSkills) === JSON.stringify(skills)) {
        return prevSkills;
      }
      return skills;
    });
    
    // If enhanced resume data is provided, store it
    if (data) {
      setResumeData(data);
      setAiAnalysisEnabled(true);
    }
  }, []);

  const handleEmailSelect = useCallback((email) => {
    setSelectedEmail(prev => {
      if (prev?.id === email?.id) return prev;
      return email;
    });
  }, []);

  const handleBatchAnalysis = useCallback(async () => {
    if (!resumeData || emails.length === 0) return;

    setBatchAnalysisStatus('running');
    
    try {
      const emailsToAnalyze = emails.slice(0, 20).map(email => ({
        id: email.id,
        subject: email.subject,
        snippet: email.snippet,
        body: email.body
      }));

      const response = await aiApiService.batchAnalyzeEmails(emailsToAnalyze, resumeData);
      
      if (response.success) {
        setBatchAnalysisStatus('complete');
        // You could update the emails with analysis results here
        console.log('Batch analysis results:', response.data);
      } else {
        setBatchAnalysisStatus('error');
      }
    } catch (error) {
      console.error('Batch analysis error:', error);
      setBatchAnalysisStatus('error');
    }

    // Reset status after 3 seconds
    setTimeout(() => setBatchAnalysisStatus(null), 3000);
  }, [resumeData, emails]);

  useEffect(() => {
    fetchSavedEmails();
  }, [fetchSavedEmails]);

  // Memoize the EmailCard components to prevent unnecessary re-renders
  const emailCards = useMemo(() => {
    return filteredEmails.slice(0, 10).map((email, index) => (
      <EmailCard
        key={email?.id || index}
        id={email?.id}
        subject={email?.subject || 'No Subject'}
        snippet={email?.snippet || 'No preview available'}
        onClick={() => handleEmailSelect(email)}
        isSelected={selectedEmail?.id === email?.id}
        skills={extractedSkills}
        isSaved={savedEmails.some(saved => saved.id === email?.id)}
        onSave={handleSaveEmail}
      />
    ));
  }, [filteredEmails, selectedEmail, extractedSkills, savedEmails, handleEmailSelect, handleSaveEmail]);

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
          <div className="nav-tabs">
            <button
              className={`tab ${activeTab === 'inbox' ? 'active' : ''}`}
              onClick={() => setActiveTab('inbox')}
            >
              📥 Inbox
            </button>
            <button
              className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              📌 Saved Emails
            </button>
          </div>

          <TagFilter 
            selectedTags={selectedTags}
            onTagSelect={setSelectedTags}
          />
          <ResumeUpload onResumeDataExtracted={handleSkillsExtracted} />
          <AnalyticsPanel emails={emails} skills={extractedSkills} />
        </div>

        <div className="middle-column">
          {activeTab === 'inbox' ? (
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
                  {emailCards}
                </div>
              )}
            </section>
          ) : (
            <SavedEmails 
              emails={savedEmails}
              onUnsaveEmail={handleUnsaveEmail}
            />
          )}

          {extractedSkills.length > 0 && activeTab === 'inbox' && (
            <SuggestedMatches 
              skills={extractedSkills}
              emails={emails}
            />
          )}
        </div>

        <div className="right-column">
          {aiAnalysisEnabled && resumeData ? (
            <AISuggestionPanel 
              selectedEmail={selectedEmail}
              resumeData={resumeData}
              skills={extractedSkills}
            />
          ) : (
            <SuggestionPanel 
              selectedEmail={selectedEmail}
              skills={extractedSkills}
            />
          )}
          
          {/* Batch Analysis Controls */}
          {resumeData && emails.length > 0 && (
            <div className="batch-analysis-section">
              <h3>🚀 Batch Analysis</h3>
              <button
                className="batch-analyze-btn"
                onClick={handleBatchAnalysis}
                disabled={batchAnalysisStatus === 'running'}
              >
                {batchAnalysisStatus === 'running' ? 'Analyzing...' : 'Analyze All Emails'}
              </button>
              {batchAnalysisStatus && (
                <div className={`batch-status ${batchAnalysisStatus}`}>
                  {batchAnalysisStatus === 'running' && 'AI is analyzing your emails...'}
                  {batchAnalysisStatus === 'complete' && 'Analysis complete!'}
                  {batchAnalysisStatus === 'error' && 'Analysis failed. Please try again.'}
                </div>
              )}
            </div>
          )}
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

        .nav-tabs {
          display: flex;
          gap: 0.5rem;
          background: white;
          padding: 1rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          margin-bottom: 1rem;
        }

        .tab {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: #6B7280;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab:hover {
          background: #F3F4F6;
          color: #4F46E5;
        }

        .tab.active {
          background: #4F46E5;
          color: white;
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

        .batch-analysis-section {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-top: 1rem;
        }

        .batch-analyze-btn {
          width: 100%;
          padding: 0.75rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .batch-analyze-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .batch-analyze-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .batch-status {
          margin-top: 0.5rem;
          padding: 0.5rem;
          border-radius: 6px;
          font-size: 0.875rem;
          text-align: center;
        }

        .batch-status.running {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .batch-status.complete {
          background: #dcfce7;
          color: #166534;
        }

        .batch-status.error {
          background: #fef2f2;
          color: #dc2626;
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
};
