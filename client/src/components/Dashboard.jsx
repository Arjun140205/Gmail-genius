import React from 'react';

const Dashboard = ({ user }) => {
  return (
    <div style={{
      padding: '2rem',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: '#fff',
      minHeight: '100vh'
    }}>
      <h2>Welcome, {user.name}!</h2>
      <img
        src={user.picture}
        alt="Profile"
        style={{ borderRadius: '50%', width: '120px', marginTop: '1rem' }}
      />
      <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>{user.email}</p>
    </div>
  );
};

export default Dashboard;

