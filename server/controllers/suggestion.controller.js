// controllers/suggestion.controller.js
import { matchSkillsToEmails } from '../utils/matcher.js';
import { google } from 'googleapis';

const getEmailsFromGmail = async (req) => {
  if (!req.user || !req.user.accessToken) {
    throw new Error('User not authenticated');
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: req.user.accessToken });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 20 // Limit to avoid rate limiting
    });

    const emails = await Promise.all(
      response.data.messages.map(async (message) => {
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id
        });
        return {
          id: email.data.id,
          body: email.data.snippet,
          subject: email.data.payload?.headers?.find(h => h.name.toLowerCase() === 'subject')?.value || '',
          date: email.data.payload?.headers?.find(h => h.name.toLowerCase() === 'date')?.value || ''
        };
      })
    );

    return emails;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
};

export const generateSuggestions = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'No email content provided.' });
    }

    // TODO: Implement suggestion generation logic
    res.json({ suggestions: [] });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ message: 'Error generating suggestions', error: error.message });
  }
};

export const matchSuggestions = async (req, res) => {
  try {
    const { email, skills } = req.body;
    
    if (!email || !skills) {
      return res.status(400).json({ 
        message: 'Both email content and skills are required.' 
      });
    }

    const emailContent = typeof email === 'string' ? email : `${email.subject} ${email.snippet}`;
    
    // Extract tech keywords from the email
    const techKeywords = extractTechKeywords(emailContent.toLowerCase());
    
    // Compare with user's skills
    const skillsLower = skills.map(s => s.toLowerCase());
    
    const matches = [];
    const gaps = [];
    const related = [];

    // Check each keyword
    techKeywords.forEach(keyword => {
      if (skillsLower.some(skill => skill.includes(keyword) || keyword.includes(skill))) {
        matches.push(keyword);
      } else {
        gaps.push(keyword);
      }
    });

    // Find related skills
    gaps.forEach(gap => {
      const relatedSkills = findRelatedSkills(gap);
      related.push(...relatedSkills.filter(s => !related.includes(s)));
    });

    res.json({
      matches,
      gaps,
      related,
      summary: {
        totalMatches: matches.length,
        totalGaps: gaps.length,
        matchPercentage: Math.round((matches.length / (matches.length + gaps.length)) * 100)
      }
    });
  } catch (error) {
    console.error('Error matching skills:', error);
    res.status(500).json({ message: 'Error matching skills', error: error.message });
  }
};

// Helper function to extract tech keywords
const extractTechKeywords = (text) => {
  const keywords = [
    'javascript', 'typescript', 'python', 'java', 'c#', 'react', 'vue', 'angular',
    'node.js', 'express', 'django', 'flask', 'spring', 'docker', 'kubernetes',
    'aws', 'azure', 'gcp', 'sql', 'mongodb', 'postgresql', 'redis', 'graphql',
    'rest', 'api', 'git', 'ci/cd', 'jenkins', 'github actions', 'agile', 'scrum'
  ];

  return keywords.filter(keyword => text.includes(keyword));
};

// Helper function to find related skills
const findRelatedSkills = (skill) => {
  const relatedSkills = {
    'react': ['redux', 'nextjs', 'gatsby'],
    'vue': ['vuex', 'nuxt'],
    'angular': ['rxjs', 'ngrx'],
    'node.js': ['express', 'nestjs', 'typescript'],
    'python': ['django', 'flask', 'fastapi'],
    'java': ['spring', 'hibernate', 'maven'],
    'docker': ['kubernetes', 'jenkins', 'ci/cd'],
    // Add more relationships as needed
  };

  return relatedSkills[skill] || [];
};