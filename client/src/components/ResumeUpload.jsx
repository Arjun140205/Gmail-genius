// src/components/ResumeUpload.jsx
import React, { useState } from 'react';
import axios from 'axios';

const ResumeUpload = ({ onSkillsExtracted }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError('Please select a PDF file');
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
      const res = await axios.post('http://localhost:3500/api/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      onSkillsExtracted(res.data.skills);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Error uploading resume');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="resume-upload">
      <h3>📄 Upload Your Resume</h3>
      <div className="upload-container">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          id="resume-upload"
          className="file-input"
        />
        <label htmlFor="resume-upload" className="file-label">
          {file ? file.name : 'Choose PDF file'}
        </label>
        <button
          onClick={uploadResume}
          disabled={uploading || !file}
          className="upload-button"
        >
          {uploading ? 'Uploading...' : 'Upload Resume'}
        </button>
      </div>
      {error && <p className="error-message">{error}</p>}

      <style jsx="true">{`
        .resume-upload {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .resume-upload h3 {
          margin: 0 0 1rem 0;
          color: #1a1a1a;
        }

        .upload-container {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .file-input {
          display: none;
        }

        .file-label {
          flex: 1;
          padding: 0.75rem 1rem;
          background: #f3f4f6;
          border: 1px dashed #d1d5db;
          border-radius: 6px;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: all 0.2s;
        }

        .file-label:hover {
          background: #e5e7eb;
        }

        .upload-button {
          padding: 0.75rem 1.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }

        .upload-button:hover:not(:disabled) {
          background: #2563eb;
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
      `}</style>
    </div>
  );
};

export default ResumeUpload;