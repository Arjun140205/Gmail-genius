// src/components/ResumeUpload.jsx
import React, { useState } from 'react';
import axios from 'axios';

const ResumeUpload = ({ onSkillsExtracted, onResumeDataExtracted, onResumeUpload }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [success, setSuccess] = useState(false);

  // Determine which callback to use - prioritize the new enhanced callback
  const callbackFunction = onResumeDataExtracted || onResumeUpload || onSkillsExtracted;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Accept PDF, DOC, DOCX, and TXT files
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setError(null);
        setSuccess(false);
      } else {
        setFile(null);
        setError('Please select a PDF, DOC, DOCX, or TXT file');
      }
    }
  };

  const uploadResume = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setUploading(true);
      setError(null);
      setAiStatus('🤖 Analyzing resume with AI...');
      
      console.log('📄 Starting resume upload...');
      const res = await axios.post('http://localhost:3500/api/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      console.log('✅ Resume upload successful:', res.data);

      // Handle different callback types
      if (onResumeDataExtracted) {
        // Enhanced callback with AI data
        if (res.data.aiAnalysis) {
          onResumeDataExtracted(res.data.skills, {
            skills: res.data.aiAnalysis.skills,
            experience: res.data.aiAnalysis.experience,
            education: res.data.aiAnalysis.education,
            summary: res.data.aiAnalysis.summary,
            allSkills: res.data.skills, // Flattened list
            extractedText: res.data.extractedText
          });
        } else {
          // Fallback to basic skills only
          onResumeDataExtracted(res.data.skills, null);
        }
      } else if (onResumeUpload) {
        // Enhanced Dashboard callback
        if (res.data.aiAnalysis) {
          onResumeUpload(res.data.skills, {
            skills: res.data.aiAnalysis.skills,
            experience: res.data.aiAnalysis.experience,
            education: res.data.aiAnalysis.education,
            summary: res.data.aiAnalysis.summary,
            allSkills: res.data.skills,
            extractedText: res.data.extractedText
          });
        } else {
          onResumeUpload(res.data.skills, null);
        }
      } else if (onSkillsExtracted) {
        // Legacy callback for basic skills only
        onSkillsExtracted(res.data.skills);
      } else if (callbackFunction) {
        // Safety fallback
        callbackFunction(res.data.skills, res.data.aiAnalysis);
      }

      setSuccess(true);
      setAiStatus('✅ AI analysis complete!');
      setTimeout(() => {
        setAiStatus(null);
        setSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Error uploading resume');
      setAiStatus('❌ AI analysis failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="resume-upload">
      <h3>📄 Upload Your Resume</h3>
      <p className="upload-description">
        Upload your resume to enable AI-powered job matching and analysis
      </p>
      
      {aiStatus && (
        <div className={`ai-status ${success ? 'success' : 'processing'}`}>
          <p>{aiStatus}</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}
      
      <div className="upload-container">
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          id="resume-upload"
          className="file-input"
        />
        <label htmlFor="resume-upload" className="file-label">
          <span className="file-icon">📎</span>
          <span className="file-text">
            {file ? file.name : 'Choose resume file (PDF, DOC, DOCX, TXT)'}
          </span>
        </label>
        
        <button
          onClick={uploadResume}
          disabled={!file || uploading}
          className={`upload-btn ${uploading ? 'uploading' : ''}`}
        >
          {uploading ? (
            <>
              <span className="spinner"></span>
              Analyzing...
            </>
          ) : (
            <>
              <span>🚀</span>
              Upload & Analyze
            </>
          )}
        </button>
      </div>

      <style jsx="true">{`
        .resume-upload {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          margin-bottom: 2rem;
        }

        .resume-upload h3 {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .upload-description {
          color: #6b7280;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .ai-status {
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          text-align: center;
          font-weight: 600;
        }

        .ai-status.success {
          background: #dcfce7;
          border: 1px solid #10b981;
          color: #065f46;
        }

        .ai-status.processing {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          color: #92400e;
        }

        .ai-status p {
          margin: 0;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #ef4444;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .error-message p {
          margin: 0;
          color: #dc2626;
          font-weight: 600;
        }

        .upload-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .file-input {
          display: none;
        }

        .file-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: #f9fafb;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          min-height: 60px;
        }

        .file-label:hover {
          background: #f3f4f6;
          border-color: #3b82f6;
        }

        .file-icon {
          font-size: 1.25rem;
        }

        .file-text {
          flex: 1;
          color: #374151;
          font-weight: 500;
        }

        .upload-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 2rem;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          font-size: 1rem;
        }

        .upload-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
        }

        .upload-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .upload-btn.uploading {
          background: #6b7280;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff40;
          border-top: 2px solid #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .resume-upload {
            padding: 1.5rem;
          }

          .file-label {
            flex-direction: column;
            text-align: center;
            min-height: 80px;
          }

          .upload-btn {
            width: 100%;
          }
        }
        }

        .upload-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .error-message {
          color: #ef4444;
          margin: 0.5rem 0 0;
          font-size: 0.875rem;
        }

        .ai-status {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 6px;
          padding: 0.75rem;
          margin-bottom: 1rem;
        }

        .ai-status p {
          margin: 0;
          color: #0c4a6e;
          font-size: 0.875rem;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default ResumeUpload;