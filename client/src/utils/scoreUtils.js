/**
 * Calculate a match score between email content and skills
 * @param {string} emailContent - Combined subject and body text
 * @param {string[]} skills - Array of skills from resume
 * @returns {object} Score details including percentage and matched skills
 */
export const calculateMatchScore = (emailContent, skills) => {
  if (!emailContent || !skills || skills.length === 0) {
    return { score: 0, matchedSkills: [], totalSkills: 0 };
  }

  const content = emailContent.toLowerCase();
  const matchedSkills = skills.filter(skill => 
    typeof skill === 'string' && content.includes(skill.toLowerCase())
  );

  // Calculate score based on matched skills
  const score = (matchedSkills.length / skills.length) * 100;

  return {
    score: Math.round(score), // Round to nearest integer
    matchedSkills,
    totalSkills: skills.length
  };
};

/**
 * Get color based on score percentage
 * @param {number} score - Score percentage
 * @returns {string} CSS color value
 */
export const getScoreColor = (score) => {
  if (score >= 80) return '#059669'; // Green
  if (score >= 60) return '#0891B2'; // Cyan
  if (score >= 40) return '#6366F1'; // Indigo
  if (score >= 20) return '#7C3AED'; // Purple
  return '#6B7280'; // Gray
};
