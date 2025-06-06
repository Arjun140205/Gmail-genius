import express from 'express';
import { google } from 'googleapis';

const router = express.Router();

router.get('/emails', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated' });

  try {
    // Log user and access token for debugging
    console.log('User:', req.user);
    console.log('Access Token:', req.user.accessToken);

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
      maxResults: 10,
    });

    const messages = response.data.messages || [];

    const emails = await Promise.all(
      messages.map(async (msg) => {
        const full = await gmail.users.messages.get({ userId: 'me', id: msg.id });
        return {
          id: msg.id,
          snippet: full.data.snippet,
          subject: full.data.payload.headers.find(h => h.name === 'Subject')?.value || '(No Subject)',
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
