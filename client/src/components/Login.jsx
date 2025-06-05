import React from 'react';

const Login = () => {
  const handleLogin = () => {
    // Redirect to your backend OAuth route
    window.location.href = 'http://localhost:3500/auth/google';
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100vh', backgroundColor: '#f5f5f7',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>Welcome to GmailGenius</h1>
      <button
        onClick={handleLogin}
        style={{
          padding: '12px 24px',
          fontSize: '1.1rem',
          color: 'white',
          backgroundColor: '#4285F4',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(66, 133, 244, 0.4)',
          transition: 'background-color 0.3s ease'
        }}
        onMouseEnter={e => e.target.style.backgroundColor = '#3367D6'}
        onMouseLeave={e => e.target.style.backgroundColor = '#4285F4'}
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
