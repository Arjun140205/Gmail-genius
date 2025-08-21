// client/src/components/EmailDetailModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { aiApiService } from '../services/aiApiService';

const EmailDetailModal = ({ email, resumeData, onClose, isOpen }) => {
  const [emailDetails, setEmailDetails] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const fetchEmailDetails = useCallback(async () => {
    if (!email?.id) {
      console.log('❌ No email ID provided for fetchEmailDetails');
      return;
    }
    
    try {
      console.log('🔍 Fetching email details for:', email.id);
      setLoading(true);
      const response = await fetch(`http://localhost:3500/api/gmail/email/${email.id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Email details fetched:', data);
        setEmailDetails(data.email);
      } else {
        console.error('❌ Failed to fetch email details:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error fetching email details:', error);
    } finally {
      setLoading(false);
    }
  }, [email?.id]);

  const performAIAnalysis = useCallback(async () => {
    if (!email || !resumeData) {
      console.log('❌ Missing email or resume data for AI analysis');
      return;
    }
    
    try {
      console.log('🤖 Starting AI analysis for email:', email.id);
      setLoading(true);
      
      // Use the new analyzeJobMatch method
      const emailContent = email.snippet || email.body || email.subject || '';
      
      // Validate that we have meaningful content
      if (!emailContent || emailContent.trim().length === 0) {
        console.warn('⚠️ No email content available for AI analysis');
        setLoading(false);
        return;
      }
      
      console.log('📝 Email content for analysis:', emailContent.substring(0, 100) + '...');
      const analysis = await aiApiService.analyzeJobMatch(resumeData, emailContent, {
        includeRecommendations: true,
        detailedAnalysis: true,
        skillMapping: true
      });

      console.log('🎯 AI analysis result:', analysis);

      if (analysis.success) {
        console.log('✅ AI analysis successful, setting analysis data');
        setAiAnalysis({
          emailAnalysis: {
            jobType: analysis.jobDetails?.jobTitle ? 'job' : 'other',
            company: analysis.jobDetails?.company || 'Unknown',
            relevanceScore: analysis.matchPercentage || 0,
            summary: analysis.analysis?.summary || 'No summary available'
          },
          matchAnalysis: {
            matchPercentage: analysis.matchPercentage || 0,
            confidenceLevel: analysis.confidence > 80 ? 'high' : analysis.confidence > 50 ? 'medium' : 'low',
            matchedSkills: analysis.matchedSkills || [],
            missingSkills: analysis.missingSkills || [],
            recommendations: analysis.recommendations || []
          }
        });
      } else {
        console.warn('⚠️ AI analysis failed:', analysis.error);
        setAiAnalysis(null);
      }
    } catch (error) {
      console.error('❌ AI analysis failed:', error);
      setAiAnalysis(null);
    } finally {
      setLoading(false);
    }
  }, [email, resumeData]);

  useEffect(() => {
    if (isOpen && email) {
      fetchEmailDetails();
      if (resumeData) {
        performAIAnalysis();
      }
    }
  }, [isOpen, email, resumeData, fetchEmailDetails, performAIAnalysis]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const extractEmailAddress = (fullEmail) => {
    if (!fullEmail || typeof fullEmail !== 'string') return 'Unknown';
    const match = fullEmail.match(/<(.+)>/);
    return match ? match[1] : fullEmail;
  };

  const extractDisplayName = (fullEmail) => {
    if (!fullEmail || typeof fullEmail !== 'string') return 'Unknown Sender';
    const match = fullEmail.match(/^(.+?)\s*</);
    return match ? match[1].replace(/"/g, '') : fullEmail;
  };

  // Early return if email is not provided (after all hooks)
  if (!email) {
    console.warn('EmailDetailModal: No email provided');
    return null;
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📧 Email Details</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading email details...</p>
          </div>
        ) : (
          <>
            <div className="modal-tabs">
              <button 
                className={`tab ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                📄 Details
              </button>
              <button 
                className={`tab ${activeTab === 'content' ? 'active' : ''}`}
                onClick={() => setActiveTab('content')}
              >
                📝 Content
              </button>
              {aiAnalysis && (
                <button 
                  className={`tab ${activeTab === 'analysis' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analysis')}
                >
                  🤖 AI Analysis
                </button>
              )}
            </div>

            <div className="modal-content">
              {activeTab === 'details' && (
                <div className="details-tab">
                  <div className="email-header">
                    <h3>{email.subject || '(No Subject)'}</h3>
                    <div className="email-meta">
                      <div className="meta-row">
                        <span className="label">From:</span>
                        <span className="value">
                          <strong>{extractDisplayName(email.from)}</strong>
                          <br />
                          <small>{extractEmailAddress(email.from)}</small>
                        </span>
                      </div>
                      {emailDetails?.to && (
                        <div className="meta-row">
                          <span className="label">To:</span>
                          <span className="value">{emailDetails.to}</span>
                        </div>
                      )}
                      {emailDetails?.cc && (
                        <div className="meta-row">
                          <span className="label">CC:</span>
                          <span className="value">{emailDetails.cc}</span>
                        </div>
                      )}
                      <div className="meta-row">
                        <span className="label">Date:</span>
                        <span className="value">{formatDate(email.date || emailDetails?.date)}</span>
                      </div>
                      <div className="meta-row">
                        <span className="label">Category:</span>
                        <span className={`category-badge ${email.category}`}>
                          {email.category?.toUpperCase() || 'PRIMARY'}
                        </span>
                      </div>
                    </div>

                    <div className="email-labels">
                      {email.labels?.map((label, index) => (
                        <span key={index} className={`label-badge ${label.toLowerCase()}`}>
                          {label.replace('CATEGORY_', '')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'content' && (
                <div className="content-tab">
                  <div className="email-snippet">
                    <h4>Preview:</h4>
                    <p>{email.snippet || 'No preview available'}</p>
                  </div>
                  
                  {emailDetails?.body && (
                    <div className="email-body">
                      <h4>Full Content:</h4>
                      <div className="body-content">
                        {emailDetails.htmlBody ? (
                          <div dangerouslySetInnerHTML={{ __html: emailDetails.htmlBody }} />
                        ) : (
                          <pre>{emailDetails.body}</pre>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analysis' && aiAnalysis && (
                <div className="analysis-tab">
                  {/* Email Analysis */}
                  <div className="analysis-section">
                    <h4>📧 Email Analysis</h4>
                    <div className="analysis-grid">
                      <div className="analysis-item">
                        <span className="label">Type:</span>
                        <span className={`badge ${aiAnalysis.emailAnalysis?.jobType || 'other'}`}>
                          {aiAnalysis.emailAnalysis?.jobType || 'Other'}
                        </span>
                      </div>
                      
                      {aiAnalysis.emailAnalysis?.company && (
                        <div className="analysis-item">
                          <span className="label">Company:</span>
                          <span>{aiAnalysis.emailAnalysis.company}</span>
                        </div>
                      )}

                      <div className="analysis-item">
                        <span className="label">Relevance:</span>
                        <div className="relevance-bar">
                          <div 
                            className="relevance-fill"
                            style={{ width: `${aiAnalysis.emailAnalysis?.relevanceScore || 0}%` }}
                          ></div>
                          <span className="relevance-text">{aiAnalysis.emailAnalysis?.relevanceScore || 0}%</span>
                        </div>
                      </div>
                    </div>

                    {aiAnalysis.emailAnalysis?.summary && (
                      <div className="summary">
                        <h5>Summary:</h5>
                        <p>{aiAnalysis.emailAnalysis.summary}</p>
                      </div>
                    )}
                  </div>

                  {/* Match Analysis */}
                  {aiAnalysis.matchAnalysis && (
                    <div className="analysis-section">
                      <h4>🎯 Match Analysis</h4>
                      
                      <div className="match-score-large">
                        <div className="score-circle-large">
                          <span className="score-number">{aiAnalysis.matchAnalysis?.matchPercentage || 0}%</span>
                          <span className="score-label">Match</span>
                        </div>
                        <div className="confidence">
                          <span className={`confidence-badge ${aiAnalysis.matchAnalysis?.confidenceLevel || 'medium'}`}>
                            {aiAnalysis.matchAnalysis?.confidenceLevel || 'medium'} confidence
                          </span>
                        </div>
                      </div>

                      {aiAnalysis.matchAnalysis?.matchedSkills && aiAnalysis.matchAnalysis.matchedSkills.length > 0 && (
                        <div className="skills-section">
                          <h5>✅ Your Matching Skills</h5>
                          <div className="skills-grid">
                            {aiAnalysis.matchAnalysis.matchedSkills.map((skill, index) => (
                              <span key={index} className="skill-tag matched">
                                {skill?.skill || skill}
                                {skill?.relevance && <span className="relevance">({skill.relevance})</span>}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {aiAnalysis.matchAnalysis?.missingSkills && aiAnalysis.matchAnalysis.missingSkills.length > 0 && (
                        <div className="skills-section">
                          <h5>📚 Skills to Learn</h5>
                          <div className="skills-grid">
                            {aiAnalysis.matchAnalysis.missingSkills.map((skill, index) => (
                              <span key={index} className={`skill-tag missing ${skill?.priority || 'medium'}`}>
                                {skill?.skill || skill}
                                <span className="priority">({skill?.priority || 'medium'})</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {aiAnalysis.matchAnalysis?.recommendations && (
                        <div className="recommendations">
                          <h5>💡 AI Recommendations</h5>
                          <ul>
                            {aiAnalysis.matchAnalysis.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="action-buttons">
                        <button 
                          className={`apply-btn ${aiAnalysis.matchAnalysis.shouldApply ? 'recommended' : 'caution'}`}
                        >
                          {aiAnalysis.matchAnalysis.shouldApply ? '✅ Apply Now' : '⚠️ Improve Skills First'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <style jsx="true">{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 2rem;
          }

          .modal-container {
            background: white;
            border-radius: 16px;
            width: 100%;
            max-width: 900px;
            max-height: 90vh;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 2rem;
            border-bottom: 1px solid #e5e7eb;
            background: #f9fafb;
          }

          .modal-header h2 {
            margin: 0;
            color: #1f2937;
            font-size: 1.5rem;
            font-weight: 600;
          }

          .close-button {
            background: none;
            border: none;
            font-size: 2rem;
            color: #6b7280;
            cursor: pointer;
            padding: 0;
            width: 2rem;
            height: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s;
          }

          .close-button:hover {
            background: #f3f4f6;
            color: #374151;
          }

          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem;
          }

          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e5e7eb;
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .modal-tabs {
            display: flex;
            border-bottom: 1px solid #e5e7eb;
            background: #f9fafb;
          }

          .tab {
            padding: 1rem 1.5rem;
            border: none;
            background: none;
            cursor: pointer;
            font-weight: 500;
            color: #6b7280;
            border-bottom: 2px solid transparent;
            transition: all 0.2s;
          }

          .tab:hover {
            color: #374151;
            background: #f3f4f6;
          }

          .tab.active {
            color: #3b82f6;
            border-bottom-color: #3b82f6;
            background: white;
          }

          .modal-content {
            flex: 1;
            overflow-y: auto;
            padding: 2rem;
          }

          .email-header h3 {
            margin: 0 0 1rem 0;
            color: #1f2937;
            font-size: 1.25rem;
            line-height: 1.4;
          }

          .email-meta {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-bottom: 1rem;
          }

          .meta-row {
            display: flex;
            gap: 1rem;
          }

          .meta-row .label {
            font-weight: 600;
            color: #374151;
            min-width: 80px;
          }

          .meta-row .value {
            flex: 1;
            color: #6b7280;
          }

          .category-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
          }

          .category-badge.primary { background: #dbeafe; color: #1d4ed8; }
          .category-badge.social { background: #dcfce7; color: #166534; }
          .category-badge.promotions { background: #fef3c7; color: #92400e; }
          .category-badge.updates { background: #f3e8ff; color: #7c3aed; }

          .email-labels {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 1rem;
          }

          .label-badge {
            padding: 0.25rem 0.5rem;
            background: #f3f4f6;
            color: #374151;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
          }

          .label-badge.important { background: #fef2f2; color: #dc2626; }
          .label-badge.unread { background: #eff6ff; color: #2563eb; }

          .email-snippet {
            margin-bottom: 2rem;
          }

          .email-snippet h4 {
            margin: 0 0 0.5rem 0;
            color: #374151;
          }

          .email-snippet p {
            color: #6b7280;
            font-style: italic;
            background: #f9fafb;
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }

          .email-body h4 {
            margin: 0 0 1rem 0;
            color: #374151;
          }

          .body-content {
            background: #f9fafb;
            border-radius: 8px;
            padding: 1.5rem;
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #e5e7eb;
          }

          .body-content pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            margin: 0;
            font-family: 'Inter', sans-serif;
            font-size: 0.875rem;
            line-height: 1.5;
          }

          .analysis-section {
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid #e5e7eb;
          }

          .analysis-section:last-child {
            border-bottom: none;
          }

          .analysis-section h4 {
            margin: 0 0 1rem 0;
            color: #374151;
            font-size: 1.125rem;
          }

          .analysis-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1rem;
          }

          .analysis-item {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .analysis-item .label {
            font-weight: 600;
            color: #374151;
            font-size: 0.875rem;
          }

          .badge {
            padding: 0.25rem 0.75rem;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: capitalize;
            width: fit-content;
          }

          .badge.job { background: #dbeafe; color: #1d4ed8; }
          .badge.internship { background: #dcfce7; color: #166534; }
          .badge.freelance { background: #fef3c7; color: #92400e; }
          .badge.other { background: #f3f4f6; color: #374151; }

          .relevance-bar {
            position: relative;
            height: 24px;
            background: #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
          }

          .relevance-fill {
            height: 100%;
            background: linear-gradient(90deg, #ef4444, #f59e0b, #10b981);
            transition: width 0.3s ease;
          }

          .relevance-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 0.75rem;
            font-weight: 600;
            color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          }

          .match-score-large {
            display: flex;
            align-items: center;
            gap: 2rem;
            margin-bottom: 2rem;
            justify-content: center;
          }

          .score-circle-large {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: conic-gradient(from 0deg, #10b981, #3b82f6);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
          }

          .score-circle-large .score-number {
            font-size: 2rem;
          }

          .score-circle-large .score-label {
            font-size: 0.875rem;
          }

          .confidence-badge {
            padding: 0.5rem 1rem;
            border-radius: 999px;
            font-weight: 600;
            text-transform: capitalize;
          }

          .confidence-badge.high { background: #dcfce7; color: #166534; }
          .confidence-badge.medium { background: #fef3c7; color: #92400e; }
          .confidence-badge.low { background: #fef2f2; color: #dc2626; }

          .skills-section {
            margin-bottom: 1.5rem;
          }

          .skills-section h5 {
            margin: 0 0 0.75rem 0;
            color: #374151;
            font-size: 1rem;
          }

          .skills-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .skill-tag {
            padding: 0.25rem 0.75rem;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 500;
          }

          .skill-tag.matched {
            background: #dcfce7;
            color: #166534;
          }

          .skill-tag.missing {
            background: #fef2f2;
            color: #dc2626;
          }

          .skill-tag.missing.high {
            border: 2px solid #dc2626;
          }

          .priority, .relevance {
            font-size: 0.6rem;
            opacity: 0.8;
          }

          .recommendations ul {
            padding-left: 1.5rem;
            margin: 0;
          }

          .recommendations li {
            margin-bottom: 0.5rem;
            color: #374151;
            line-height: 1.5;
          }

          .action-buttons {
            margin-top: 2rem;
            display: flex;
            justify-content: center;
          }

          .apply-btn {
            padding: 0.75rem 2rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 1rem;
          }

          .apply-btn.recommended {
            background: #10b981;
            color: white;
          }

          .apply-btn.caution {
            background: #f59e0b;
            color: white;
          }

          .apply-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .summary {
            background: #f9fafb;
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }

          .summary h5 {
            margin: 0 0 0.5rem 0;
            color: #374151;
          }

          .summary p {
            margin: 0;
            color: #6b7280;
            line-height: 1.5;
          }

          @media (max-width: 768px) {
            .modal-overlay {
              padding: 1rem;
            }

            .modal-container {
              max-width: 100%;
            }

            .modal-header {
              padding: 1rem;
            }

            .modal-content {
              padding: 1rem;
            }

            .match-score-large {
              flex-direction: column;
              gap: 1rem;
            }

            .analysis-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default EmailDetailModal;
