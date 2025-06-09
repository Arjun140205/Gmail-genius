import express from 'express';
import { google } from 'googleapis';

const router = express.Router();

function findHeader(payload, headerName) {
  if (!payload) return null;

  if (payload.headers) {
    const header = payload.headers.find(h => h.name.toLowerCase() === headerName.toLowerCase());
    if (header) {
      console.log(`Found header "${headerName}":`, header.value);
      return header;
    }
  }

  if (payload.parts && payload.parts.length > 0) {
    for (const part of payload.parts) {
      const found = findHeader(part, headerName);
      if (found) return found;
    }
  }

  return null;
}

router.get('/emails', async (req, res) => {
  if (!req.isAuthenticated()) {
    console.log('User not authenticated');
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    console.log('Authenticated user:', req.user);
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({
      access_token: req.user.accessToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 5,
    });

    console.log('Messages list response:', response.data);

    const messages = response.data.messages || [];

    const emails = await Promise.all(
      messages.map(async (msg) => {
        console.log('Fetching full message for id:', msg.id);
        const full = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'full',
        });
        console.log('Full message payload:', full.data.payload);

        const subjectHeader = findHeader(full.data.payload, 'subject');
        const subject = subjectHeader ? subjectHeader.value : '(No Subject)';
        console.log(`Message ID ${msg.id} Subject:`, subject);

        return {
          id: msg.id,
          snippet: full.data.snippet,
          subject,
          internalDate: full.data.internalDate || null,
        };
      })
    );

    res.json({ emails });
  } catch (err) {
    console.error('❌ Gmail fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

export default router;
