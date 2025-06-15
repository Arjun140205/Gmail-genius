// src/components/ResumeUpload.jsx
import React, { useState } from 'react';
import axios from 'axios';

const ResumeUpload = ({ onSkillsExtracted }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadResume = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);

    try {
      setUploading(true);
      const res = await axios.post('/api/suggestions/upload', formData);
      onSkillsExtracted(res.data.skills);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white shadow-sm p-4 rounded-md mb-6">
      <h2 className="text-lg font-semibold mb-2">📄 Upload Your Resume</h2>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="mb-2"
      />
      <button
        onClick={uploadResume}
        disabled={uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {uploading ? 'Uploading...' : 'Upload & Extract Skills'}
      </button>
    </div>
  );
};

export default ResumeUpload;