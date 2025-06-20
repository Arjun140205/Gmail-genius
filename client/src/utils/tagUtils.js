const tagPatterns = {
  internship: {
    pattern: /internship|intern|summer program/i,
    label: 'Internship',
    color: '#0891B2' // cyan
  },
  job: {
    pattern: /job|position|opportunity|opening|vacancy/i,
    label: 'Job',
    color: '#4F46E5' // indigo
  },
  remote: {
    pattern: /remote|work from home|wfh|virtual/i,
    label: 'Remote',
    color: '#059669' // green
  },
  onsite: {
    pattern: /on-site|onsite|in-office|in office/i,
    label: 'Onsite',
    color: '#7C3AED' // purple
  },
  fullTime: {
    pattern: /full-time|full time|permanent|regular/i,
    label: 'Full-time',
    color: '#2563EB' // blue
  },
  partTime: {
    pattern: /part-time|part time|temporary/i,
    label: 'Part-time',
    color: '#9333EA' // purple
  },
  offer: {
    pattern: /offer|congratulation|welcome aboard|selected/i,
    label: 'Offer',
    color: '#16A34A' // green
  },
  rejected: {
    pattern: /unfortunately|not selected|regret|won't be moving forward|rejection/i,
    label: 'Rejected',
    color: '#DC2626' // red
  },
  interview: {
    pattern: /interview|meeting|discussion|call/i,
    label: 'Interview',
    color: '#EA580C' // orange
  },
  urgent: {
    pattern: /urgent|immediate|asap|important/i,
    label: 'Urgent',
    color: '#B91C1C' // red
  }
};

/**
 * Generate tags for an email based on its content
 * @param {Object} email - Email object with subject and snippet
 * @returns {Array} Array of tag objects with label and color
 */
export const generateEmailTags = (email) => {
  if (!email) return [];

  const content = `${email.subject || ''} ${email.snippet || ''}`.toLowerCase();
  const tags = [];

  Object.entries(tagPatterns).forEach(([key, { pattern, label, color }]) => {
    if (pattern.test(content)) {
      tags.push({ id: key, label, color });
    }
  });

  return tags;
};

/**
 * Get all available tag categories
 * @returns {Array} Array of all possible tags
 */
export const getAllTagCategories = () => {
  return Object.entries(tagPatterns).map(([key, { label, color }]) => ({
    id: key,
    label,
    color
  }));
};

/**
 * Filter emails by tags
 * @param {Array} emails - Array of email objects
 * @param {Array} selectedTags - Array of selected tag IDs
 * @returns {Array} Filtered emails
 */
export const filterEmailsByTags = (emails, selectedTags) => {
  if (!selectedTags || selectedTags.length === 0) return emails;
  if (!emails || !Array.isArray(emails)) return [];

  return emails.filter(email => {
    const emailTags = generateEmailTags(email);
    return selectedTags.some(selectedTag => 
      emailTags.some(emailTag => emailTag.id === selectedTag)
    );
  });
};
