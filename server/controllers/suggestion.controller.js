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
    // This is a placeholder response
    const suggestions = {
      improvements: [
        'Consider adding a more specific subject line',
        'The email could be more concise'
      ]
    };

    res.json(suggestions);
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ message: 'Error generating suggestions' });
  }
};

export const matchSuggestions = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { skills } = req.body;
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ message: 'Skills must be provided as an array.' });
    }

    // Validate and format skills
    const formattedSkills = skills.map(skill => {
      if (typeof skill === 'string') {
        return skill;
      } else if (typeof skill === 'object' && skill !== null && 'name' in skill) {
        return skill.name;
      } else {
        console.warn('Invalid skill format:', skill);
        return null;
      }
    }).filter(skill => skill !== null);

    if (formattedSkills.length === 0) {
      return res.status(400).json({ message: 'No valid skills provided.' });
    }

    // Fetch emails from Gmail
    const emails = await getEmailsFromGmail(req);

    // Match emails with skills using the matcher utility
    const matched = await matchSkillsToEmails(emails, formattedSkills);

    res.json({ suggestions: matched });
  } catch (error) {
    console.error('Error matching suggestions:', error);
    if (error.message === 'User not authenticated') {
      res.status(401).json({ message: 'User not authenticated' });
    } else if (error.code === 429) {
      res.status(429).json({ message: 'Too many requests. Please try again later.' });
    } else {
      res.status(500).json({ message: 'Error matching suggestions' });
    }
  }
};