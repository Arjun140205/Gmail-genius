import React from 'react';

const Login = () => {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3500/auth/google';
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="brand-section">
          <h1 className="brand-title">GmailGenius</h1>
          <p className="brand-subtitle">Intelligent Email Management</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🎯</span>
            <h3>Smart Matching</h3>
            <p>Match emails with your skills and experience automatically</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📊</span>
            <h3>Analytics</h3>
            <p>Get insights into your email interactions and opportunities</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🤖</span>
            <h3>AI Powered</h3>
            <p>Advanced algorithms to analyze and categorize your emails</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">⚡</span>
            <h3>Quick Actions</h3>
            <p>Efficient tools to manage and respond to opportunities</p>
          </div>
        </div>

        <button onClick={handleGoogleLogin} className="login-button">
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google"
            className="google-icon"
          />
          Sign in with Google
        </button>
      </div>

      <style jsx="true">{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
          padding: 2rem;
        }

        .login-content {
          background: rgba(255, 255, 255, 0.95);
          padding: 3rem;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          max-width: 800px;
          width: 100%;
          text-align: center;
          backdrop-filter: blur(10px);
        }

        .brand-section {
          margin-bottom: 3rem;
        }

        .brand-title {
          font-family: 'Poppins', sans-serif;
          font-size: 3rem;
          font-weight: 700;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }

        .brand-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 1.25rem;
          color: #6b7280;
          margin-top: 0.5rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .feature-card {
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .feature-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
          display: block;
        }

        .feature-card h3 {
          font-family: 'Inter', sans-serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e1b4b;
          margin: 0 0 0.5rem 0;
        }

        .feature-card p {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
          line-height: 1.5;
        }

        .login-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          background: #4f46e5;
          color: white;
          padding: 0.875rem 2rem;
          border-radius: 9999px;
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
        }

        .login-button:hover {
          background: #4338ca;
          transform: translateY(-2px);
          box-shadow: 0 8px 12px -2px rgba(79, 70, 229, 0.3);
        }

        .google-icon {
          width: 20px;
          height: 20px;
        }

        @media (max-width: 640px) {
          .login-content {
            padding: 2rem;
          }

          .brand-title {
            font-size: 2.5rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
