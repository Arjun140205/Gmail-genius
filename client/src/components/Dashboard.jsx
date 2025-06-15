// src/pages/EmailDashboard.jsx
import React, { useState } from 'react';
import EmailCard from '../components/EmailCard';

export default function Dashboard({ user, emails, onLogout }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!resumeFile) return;

    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      setUploading(true);

      // 1. Upload Resume
      const res = await fetch('http://localhost:3500/api/resume/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      const extractedSkills = data.skills || [];
      setSkills(extractedSkills);

      // 2. Fetch Suggested Matches
      const suggestionRes = await fetch('http://localhost:3500/api/suggestions/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skills: extractedSkills }),
        credentials: 'include',
      });

      const suggestionData = await suggestionRes.json();
      setSuggestions(suggestionData.suggestions || []);
    } catch (err) {
      console.error('Upload or matching failed', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="dashboard">
      {/* 👤 User Info */}
      <div className="user-info">
        <img src={user.picture} alt="Profile" className="avatar" />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <button onClick={onLogout}>Logout</button>
      </div>

      {/* 📄 Resume Upload */}
      <section className="resume-upload">
        <h3>📄 Upload Your Resume</h3>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
        />
        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Extract & Match'}
        </button>

        {/* 🛠️ Extracted Skills */}
        {skills.length > 0 && (
          <div className="skill-box">
            <h4>🛠️ Extracted Skills:</h4>
            <ul>
              {skills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* 💡 Suggested Matches */}
      {suggestions.length > 0 && (
        <section className="suggested-emails">
          <h3>💡 Suggested Matches</h3>
          <p className="match-note">Based on your resume skills</p>
          <div className="email-grid">
            {suggestions.map((email, index) => (
              <EmailCard key={index} email={email} />
            ))}
          </div>
        </section>
      )}

      {/* 📬 All Emails */}
      <section className="email-list">
        <h3>📬 Recent Emails</h3>
        {emails.length === 0 ? (
          <p>No emails to display.</p>
        ) : (
          <div className="email-grid">
            {emails.slice(0, 10).map((email, index) => (
              <EmailCard key={index} email={email} />
            ))}
          </div>
        )}
      </section>

      {/* 💅 Styles */}
      <style>{`
        .dashboard {
          padding: 2rem;
          max-width: 800px;
          margin: auto;
          font-family: 'Segoe UI', sans-serif;
        }
        .user-info {
          text-align: center;
          margin-bottom: 2rem;
        }
        .avatar {
          width: 100px;
          border-radius: 50%;
          margin-bottom: 1rem;
        }
        .resume-upload {
          border: 1px solid #ccc;
          padding: 1rem;
          border-radius: 10px;
          margin-bottom: 2rem;
        }
        .resume-upload input {
          margin: 0.5rem 0;
        }
        .resume-upload button {
          padding: 0.5rem 1rem;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        .resume-upload button:hover {
          background-color: #0056b3;
        }
        .skill-box {
          margin-top: 1rem;
        }
        .skill-box ul {
          list-style: none;
          padding-left: 0;
        }
        .skill-box li {
          display: inline-block;
          background: #f1f3f4;
          margin: 0.3rem;
          padding: 0.3rem 0.6rem;
          border-radius: 5px;
          font-size: 0.9rem;
        }
        .email-list,
        .suggested-emails {
          margin-top: 2rem;
        }
        .email-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        .match-note {
          font-size: 0.9rem;
          color: #888;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </main>
  );
}