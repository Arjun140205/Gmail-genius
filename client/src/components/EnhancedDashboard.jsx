// client/src/components/EnhancedDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ResumeUpload from './ResumeUpload';
import SuggestedMatches from './SuggestedMatches';
import AnalyticsPanel from './AnalyticsPanel';
import SuggestionPanel from './SuggestionPanel';
import EmailSearch from './EmailSearch';
import EmailDetailModal from './EmailDetailModal';
import Pagination from './Pagination';
import { gmailApiService } from '../services/gmailApiService';
import { aiApiService } from '../services/aiApiService';

const EnhancedDashboard = ({ user }) => {
  const [emails, setEmails] = useState([]);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [suggestions, setSuggestions] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [analytics, setAnalytics] = useState(null);
  
  // Email management state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEmails, setTotalEmails] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('INBOX');
  const [emailsPerPage] = useState(20);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailMatches, setEmailMatches] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [searchFilters, setSearchFilters] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const calculateEmailMatches = useCallback(async (emailsToAnalyze) => {
    if (!resumeData) return;
    
    try {
      const matches = {};
      for (const email of emailsToAnalyze) {
        const emailContent = email.snippet || email.bodyText || email.subject || '';
        if (emailContent && emailContent.trim().length > 0) {
          const analysis = await aiApiService.analyzeJobMatch(
            resumeData, 
            emailContent
          );
          matches[email.id] = analysis;
        }
      }
      setEmailMatches(prev => ({ ...prev, ...matches }));
    } catch (error) {
      console.error('Error calculating email matches:', error);
    }
  }, [resumeData]);

  useEffect(() => {
    if (user) {
      fetchEmails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentPage, searchQuery, selectedLabel]);

  const fetchEmails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await gmailApiService.getEmails({
        page: currentPage,
        limit: emailsPerPage,
        query: searchQuery,
        labelIds: selectedLabel ? [selectedLabel] : undefined
      });
      
      setEmails(response.emails || []);
      setTotalEmails(response.totalCount || 0);
      setTotalPages(response.totalPages || 0);
      
      // Calculate matches for visible emails if resume is available
      if (resumeData && response.emails?.length > 0) {
        calculateEmailMatches(response.emails);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      setError('Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  }, [currentPage, emailsPerPage, searchQuery, selectedLabel, resumeData, calculateEmailMatches]);

  const handleSearch = useCallback((query, label) => {
    setSearchQuery(query);
    setSelectedLabel(label);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((filters) => {
    setSearchFilters(filters);
    setSearchQuery(filters.query);
    setSelectedLabel(filters.label);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleEmailClick = useCallback(async (email) => {
    try {
      // Fetch full email details
      const fullEmail = await gmailApiService.getEmailById(email.id);
      setSelectedEmail(fullEmail);
      setShowEmailModal(true);
    } catch (error) {
      console.error('Error fetching email details:', error);
      setSelectedEmail(email);
      setShowEmailModal(true);
    }
  }, []);

  const handleResumeUpload = useCallback((skills, enhancedData) => {
    // Handle the enhanced resume data structure
    if (enhancedData) {
      setResumeData({
        skills: enhancedData.skills || skills,
        experience: enhancedData.experience || [],
        education: enhancedData.education || [],
        summary: enhancedData.summary || '',
        allSkills: enhancedData.allSkills || skills,
        extractedText: enhancedData.extractedText || ''
      });
    } else {
      // Fallback to basic skills structure
      setResumeData({
        skills: skills,
        experience: [],
        education: [],
        summary: '',
        allSkills: skills,
        extractedText: ''
      });
    }
    
    // Recalculate matches for current emails
    if (emails.length > 0) {
      calculateEmailMatches(emails);
    }
  }, [emails, calculateEmailMatches]);

  const getMatchPercentage = (emailId) => {
    const match = emailMatches[emailId];
    return match ? match.matchPercentage || 0 : 0;
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return '#10b981'; // Green
    if (percentage >= 60) return '#f59e0b'; // Yellow
    if (percentage >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const EmailGrid = () => (
    <div className="email-grid">
      {emails.map((email) => {
        const matchPercentage = getMatchPercentage(email.id);
        return (
          <div
            key={email.id}
            className="email-card"
            onClick={() => handleEmailClick(email)}
          >
            <div className="email-header">
              <div className="email-from">
                <strong>{email.from || 'Unknown Sender'}</strong>
              </div>
              <div className="email-date">
                {formatDate(email.date)}
              </div>
            </div>
            
            <div className="email-subject">
              {email.subject || 'No Subject'}
            </div>
            
            <div className="email-snippet">
              {email.snippet || 'No preview available'}
            </div>
            
            {resumeData && (
              <div className="match-indicator">
                <div 
                  className="match-bar"
                  style={{ 
                    width: `${matchPercentage}%`,
                    backgroundColor: getMatchColor(matchPercentage)
                  }}
                />
                <span className="match-text">
                  {matchPercentage}% match
                </span>
              </div>
            )}
            
            <div className="email-labels">
              {email.labelIds?.slice(0, 3).map(label => (
                <span key={label} className="email-label">
                  {label.replace('CATEGORY_', '').toLowerCase()}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const EmailList = () => (
    <div className="email-list">
      <div className="list-header">
        <div className="header-col">From</div>
        <div className="header-col">Subject</div>
        <div className="header-col">Date</div>
        {resumeData && <div className="header-col">Match</div>}
      </div>
      
      {emails.map((email) => {
        const matchPercentage = getMatchPercentage(email.id);
        return (
          <div
            key={email.id}
            className="email-row"
            onClick={() => handleEmailClick(email)}
          >
            <div className="row-col from-col">
              {email.from || 'Unknown'}
            </div>
            <div className="row-col subject-col">
              <div className="subject-text">
                {email.subject || 'No Subject'}
              </div>
              <div className="snippet-text">
                {email.snippet || 'No preview'}
              </div>
            </div>
            <div className="row-col date-col">
              {formatDate(email.date)}
            </div>
            {resumeData && (
              <div className="row-col match-col">
                <div className="match-display">
                  <div 
                    className="match-circle"
                    style={{ backgroundColor: getMatchColor(matchPercentage) }}
                  />
                  {matchPercentage}%
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="enhanced-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>📧 GmailGenius - Email Management</h1>
          <div className="user-info">
            <img src={user?.picture} alt={user?.name} className="user-avatar" />
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Upload Section */}
      <div className="resume-section">
        <ResumeUpload onResumeDataExtracted={handleResumeUpload} />
      </div>

      {/* Email Search */}
      <EmailSearch
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        totalEmails={totalEmails}
      />

      {/* View Controls */}
      <div className="view-controls">
        <div className="view-modes">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            📱 Grid View
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 List View
          </button>
        </div>
        
        <div className="results-info">
          Showing {emails.length} of {totalEmails.toLocaleString()} emails
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading emails...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={fetchEmails}>Try Again</button>
        </div>
      )}

      {/* Email Content */}
      {!loading && !error && (
        <>
          {viewMode === 'grid' ? <EmailGrid /> : <EmailList />}
          
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalEmails={totalEmails}
            emailsPerPage={emailsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Email Detail Modal */}
      {showEmailModal && selectedEmail && (
        <EmailDetailModal
          email={selectedEmail}
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          resumeData={resumeData}
          matchData={emailMatches[selectedEmail.id]}
        />
      )}

      {/* Side Panels */}
      {resumeData && (
        <div className="side-panels">
          <SuggestedMatches 
            emails={emails} 
            resumeData={resumeData}
            emailMatches={emailMatches}
          />
          <AnalyticsPanel 
            emails={emails}
            emailMatches={emailMatches}
          />
          <SuggestionPanel 
            resumeData={resumeData}
            emails={emails}
          />
        </div>
      )}

      <style jsx="true">{`
        .enhanced-dashboard {
          min-height: 100vh;
          background: #f8fafc;
          padding: 1rem;
        }

        .dashboard-header {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-content h1 {
          margin: 0;
          color: #1f2937;
          font-size: 1.75rem;
          font-weight: 700;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid #e5e7eb;
        }

        .user-name {
          font-weight: 600;
          color: #1f2937;
        }

        .user-email {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .resume-section {
          margin-bottom: 2rem;
        }

        .view-controls {
          background: white;
          border-radius: 12px;
          padding: 1rem 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .view-modes {
          display: flex;
          gap: 0.5rem;
        }

        .view-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .view-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .view-btn:hover:not(.active) {
          background: #f3f4f6;
        }

        .results-info {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .loading-state, .error-state {
          background: white;
          border-radius: 12px;
          padding: 3rem;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .email-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .email-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid transparent;
        }

        .email-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          border-color: #3b82f6;
        }

        .email-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .email-from {
          color: #1f2937;
          font-size: 0.875rem;
        }

        .email-date {
          color: #6b7280;
          font-size: 0.75rem;
          white-space: nowrap;
        }

        .email-subject {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .email-snippet {
          color: #6b7280;
          font-size: 0.875rem;
          line-height: 1.4;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .match-indicator {
          margin-bottom: 0.75rem;
        }

        .match-bar {
          height: 4px;
          border-radius: 2px;
          transition: width 0.3s ease;
          margin-bottom: 0.25rem;
        }

        .match-text {
          font-size: 0.75rem;
          font-weight: 600;
          color: #374151;
        }

        .email-labels {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .email-label {
          background: #f3f4f6;
          color: #374151;
          padding: 0.125rem 0.5rem;
          border-radius: 999px;
          font-size: 0.75rem;
          text-transform: capitalize;
        }

        .email-list {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .list-header {
          display: grid;
          grid-template-columns: 200px 1fr 120px 80px;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }

        .email-row {
          display: grid;
          grid-template-columns: 200px 1fr 120px 80px;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f3f4f6;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .email-row:hover {
          background: #f9fafb;
        }

        .email-row:last-child {
          border-bottom: none;
        }

        .row-col {
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .from-col {
          font-weight: 500;
          color: #1f2937;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .subject-col {
          flex-direction: column;
          align-items: flex-start;
        }

        .subject-text {
          font-weight: 600;
          color: #1f2937;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }

        .snippet-text {
          color: #6b7280;
          font-size: 0.875rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }

        .date-col {
          color: #6b7280;
          font-size: 0.875rem;
          justify-content: center;
        }

        .match-col {
          justify-content: center;
        }

        .match-display {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .match-circle {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .side-panels {
          position: fixed;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 300px;
          max-height: 80vh;
          overflow-y: auto;
          z-index: 100;
        }

        @media (max-width: 1400px) {
          .side-panels {
            position: static;
            transform: none;
            width: 100%;
            margin-top: 2rem;
          }
        }

        @media (max-width: 768px) {
          .enhanced-dashboard {
            padding: 0.5rem;
          }

          .header-content {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .view-controls {
            flex-direction: column;
            gap: 1rem;
          }

          .email-grid {
            grid-template-columns: 1fr;
          }

          .list-header, .email-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .list-header {
            display: none;
          }

          .email-row {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedDashboard;
