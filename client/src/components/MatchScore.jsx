import React from 'react';
import { getScoreColor } from '../utils/scoreUtils';

const MatchScore = ({ score }) => {
  const color = getScoreColor(score);
  
  return (
    <div className="match-score">
      <div className="score-header">
        <span className="score-label">Match Score</span>
        <span className="score-value">{score}%</span>
      </div>
      
      <div className="score-gauge">
        <div 
          className="score-fill" 
          style={{ 
            width: `${score}%`,
            backgroundColor: color
          }} 
        />
      </div>

      <div className="score-stars">
        {[...Array(Math.ceil(score / 20))].map((_, i) => (
          <span key={i} role="img" aria-label="star">⭐️</span>
        ))}
      </div>

      <style jsx="true">{`
        .match-score {
          padding: 1rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .score-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .score-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          color: #4B5563;
        }

        .score-value {
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          color: #111827;
        }

        .score-gauge {
          height: 8px;
          background: #E5E7EB;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.75rem;
        }

        .score-fill {
          height: 100%;
          transition: width 0.5s ease-out, background-color 0.5s ease-out;
        }

        .score-stars {
          display: flex;
          gap: 0.25rem;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default MatchScore;
