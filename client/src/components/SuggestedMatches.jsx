// src/components/SuggestedMatches.jsx
import React, { useEffect, useState } from 'react';
import { suggestionsApi } from '../utils/api';
import EmailCard from './EmailCard';

const SuggestedMatches = ({ skills = [], emails = [] }) => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    // Add null safety checks
    if (!skills || !emails || skills.length === 0 || emails.length === 0) return;

    const fetchMatches = async () => {
      try {
        // Use the first email as the sample for matching
        const email = emails[0];
        if (!email) return; // Additional safety check
        
        const res = await suggestionsApi.matchSkills({ email, skills });
        setMatches(res.data.matches || []);
      } catch (err) {
        console.error('Match fetch error:', err);
        setMatches([]); // Reset matches on error
      }
    };

    fetchMatches();
  }, [skills, emails]);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">💡 Suggested Matches</h3>
      {!matches || matches.length === 0 ? (
        <p className="text-sm text-gray-600">No matches found yet.</p>
      ) : (
        matches.map((email) => (
          <EmailCard
            key={email.id || email._id || Math.random()}
            email={email}
            searchTerm="" // optional
          />
        ))
      )}
    </div>
  );
};

export default SuggestedMatches;