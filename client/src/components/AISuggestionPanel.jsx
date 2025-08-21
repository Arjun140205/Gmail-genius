// client/src/components/AISuggestionPanel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { aiApiService } from '../utils/aiApi';

const AISuggestionPanel = ({ selectedEmail, resumeData, skills = [] }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeEmailWithAI = useCallback(async () => {
    if (!selectedEmail || !resumeData) {
      setAnalysis(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, analyze the email with AI
      const emailAnalysis = await aiApiService.analyzeEmail(
        selectedEmail.subject,
        selectedEmail.snippet,
        selectedEmail.body
      );

      if (emailAnalysis.success && emailAnalysis.data.isRelevant) {
        // Then compare with resume data
        const comparison = await aiApiService.generateSmartSuggestions(
          resumeData,
          emailAnalysis.data
        );

        if (comparison.success) {
          setAnalysis({
            emailAnalysis: emailAnalysis.data,
            matchAnalysis: comparison.data
          });
        } else {
          setError('Failed to generate smart suggestions');
        }
      } else {
        setAnalysis({
          emailAnalysis: emailAnalysis.data,
          matchAnalysis: null
        });
      }
    } catch (err) {
      console.error('AI analysis error:', err);
      setError('AI analysis failed. Using fallback analysis.');
      // You could implement a fallback here
    } finally {
      setLoading(false);
    }
  }, [selectedEmail, resumeData]);

  useEffect(() => {
    analyzeEmailWithAI();
  }, [analyzeEmailWithAI]);

  if (!selectedEmail) {
    return (
      <div className="ai-suggestion-panel">
        <h3>🤖 AI-Powered Analysis</h3>
        <p className="no-email">Select an email to see AI-powered insights</p>
      </div>
    );
  }

  return (
    <div className="ai-suggestion-panel">
      <h3>🤖 AI-Powered Analysis</h3>
      
      <div className="email-preview">
        <h4>{selectedEmail.subject || 'No Subject'}</h4>
        <p className="snippet">{selectedEmail.snippet || 'No preview available'}</p>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>AI is analyzing this opportunity...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>⚠️ {error}</p>
        </div>
      )}

      {analysis && (
        <div className="analysis-results">
          {/* Email Analysis */}
          <div className="section email-analysis">
            <h5>📧 Email Analysis</h5>
            <div className="analysis-item">
              <span className="label">Type:</span>
              <span className={`badge ${analysis.emailAnalysis.jobType}`}>
                {analysis.emailAnalysis.jobType}
              </span>
            </div>
            
            {analysis.emailAnalysis.company && (
              <div className="analysis-item">
                <span className="label">Company:</span>
                <span>{analysis.emailAnalysis.company}</span>
              </div>
            )}

            <div className="analysis-item">
              <span className="label">Relevance:</span>
              <div className="relevance-bar">
                <div 
                  className="relevance-fill"
                  style={{ width: `${analysis.emailAnalysis.relevanceScore || 0}%` }}
                ></div>
                <span className="relevance-text">{analysis.emailAnalysis.relevanceScore || 0}%</span>
              </div>
            </div>

            {analysis.emailAnalysis.summary && (
              <div className="summary">
                <p>{analysis.emailAnalysis.summary}</p>
              </div>
            )}
          </div>

          {/* Match Analysis */}
          {analysis.matchAnalysis && (
            <div className="section match-analysis">
              <h5>🎯 Match Analysis</h5>
              
              <div className="match-score">
                <div className="score-circle">
                  <span className="score-number">{analysis.matchAnalysis.matchPercentage}%</span>
                  <span className="score-label">Match</span>
                </div>
                <div className="confidence">
                  <span className={`confidence-badge ${analysis.matchAnalysis.confidenceLevel}`}>
                    {analysis.matchAnalysis.confidenceLevel} confidence
                  </span>
                </div>
              </div>

              {analysis.matchAnalysis.matchedSkills && analysis.matchAnalysis.matchedSkills.length > 0 && (
                <div className="skills-section">
                  <h6>✅ Your Matching Skills</h6>
                  <div className="skills-grid">
                    {analysis.matchAnalysis.matchedSkills.map((skill, index) => (
                      <span key={index} className="skill-tag matched">
                        {skill.skill}
                        {skill.relevance && <span className="relevance">({skill.relevance})</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.matchAnalysis.missingSkills && analysis.matchAnalysis.missingSkills.length > 0 && (
                <div className="skills-section">
                  <h6>📚 Skills to Learn</h6>
                  <div className="skills-grid">
                    {analysis.matchAnalysis.missingSkills.map((skill, index) => (
                      <span key={index} className={`skill-tag missing ${skill.priority}`}>
                        {skill.skill}
                        <span className="priority">({skill.priority})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.matchAnalysis.recommendations && (
                <div className="recommendations">
                  <h6>💡 AI Recommendations</h6>
                  <ul>
                    {analysis.matchAnalysis.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="action-buttons">
                <button 
                  className={`apply-btn ${analysis.matchAnalysis.shouldApply ? 'recommended' : 'caution'}`}
                >
                  {analysis.matchAnalysis.shouldApply ? '✅ Apply Now' : '⚠️ Improve Skills First'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx="true">{`
        .ai-suggestion-panel {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          max-height: 600px;
          overflow-y: auto;
        }

        .email-preview {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .loading-state {
          text-align: center;
          padding: 2rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-state {
          background: #fef2f2;
          border: 1px solid #fecaca;
          padding: 1rem;
          border-radius: 8px;
          color: #dc2626;
        }

        .section {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .section:last-child {
          border-bottom: none;
        }

        .analysis-item {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .label {
          font-weight: 600;
          margin-right: 0.5rem;
          min-width: 80px;
        }

        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .badge.job { background: #dbeafe; color: #1d4ed8; }
        .badge.internship { background: #dcfce7; color: #166534; }
        .badge.freelance { background: #fef3c7; color: #92400e; }
        .badge.other { background: #f3f4f6; color: #374151; }

        .relevance-bar {
          flex: 1;
          height: 20px;
          background: #e5e7eb;
          border-radius: 10px;
          position: relative;
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

        .match-score {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .score-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, #10b981, #3b82f6);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
        }

        .score-number {
          font-size: 1.5rem;
        }

        .score-label {
          font-size: 0.75rem;
        }

        .confidence-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .confidence-badge.high { background: #dcfce7; color: #166534; }
        .confidence-badge.medium { background: #fef3c7; color: #92400e; }
        .confidence-badge.low { background: #fef2f2; color: #dc2626; }

        .skills-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
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

        .priority {
          font-size: 0.6rem;
          opacity: 0.8;
        }

        .recommendations ul {
          padding-left: 1rem;
        }

        .recommendations li {
          margin-bottom: 0.5rem;
        }

        .apply-btn {
          width: 100%;
          padding: 0.75rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
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
      `}</style>
    </div>
  );
};

export default AISuggestionPanel;
