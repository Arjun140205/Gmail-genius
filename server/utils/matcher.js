// utils/matcher.js
export function matchSkillsToEmails(emails, skills) {
  if (!Array.isArray(emails) || !Array.isArray(skills)) {
    throw new Error('Both emails and skills must be arrays');
  }

  const suggestions = [];

  for (const email of emails) {
    const matchedSkills = [];
    const emailContent = `${email.subject || ''} ${email.body || ''}`.toLowerCase();

    for (const skill of skills) {
      // Handle both string skills and object skills with a name property
      const skillText = typeof skill === 'string' ? skill : skill.name || '';
      
      if (typeof skillText !== 'string') {
        console.warn('Invalid skill format:', skill);
        continue;
      }

      const keyword = skillText.toLowerCase();
      if (emailContent.includes(keyword)) {
        matchedSkills.push(skillText);
      }
    }

    if (matchedSkills.length > 0) {
      suggestions.push({
        emailId: email.id,
        subject: email.subject || '',
        snippet: email.body || '',
        matchedSkills,
        date: email.date || ''
      });
    }
  }

  return suggestions;
}