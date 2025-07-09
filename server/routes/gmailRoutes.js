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
  console.log('🔍 Gmail emails endpoint hit');
  
  if (!req.isAuthenticated()) {
    console.log('❌ User not authenticated');
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    console.log('✅ Authenticated user:', {
      id: req.user?.id,
      displayName: req.user?.displayName,
      hasAccessToken: !!req.user?.accessToken
    });

    if (!req.user?.accessToken) {
      console.log('❌ No access token found');
      return res.status(401).json({ error: 'No access token available' });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    oauth2Client.setCredentials({
      access_token: req.user.accessToken,
      refresh_token: req.user.refreshToken // Add refresh token if available
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    console.log('📧 Fetching messages list...');
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10, // Increase for more emails
      q: 'in:inbox' // Only get inbox emails
    });

    console.log('📊 Messages list response:', {
      resultSizeEstimate: response.data.resultSizeEstimate,
      messagesCount: response.data.messages?.length || 0
    });

    const messages = response.data.messages || [];

    if (messages.length === 0) {
      console.log('📭 No messages found');
      return res.json({ emails: [] });
    }

    console.log('🔄 Fetching full message details...');
    const emails = await Promise.all(
      messages.map(async (msg, index) => {
        try {
          console.log(`📄 Fetching message ${index + 1}/${messages.length}: ${msg.id}`);
          const full = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'full',
          });

          const subjectHeader = findHeader(full.data.payload, 'subject');
          const subject = subjectHeader ? subjectHeader.value : '(No Subject)';
          
          const fromHeader = findHeader(full.data.payload, 'from');
          const from = fromHeader ? fromHeader.value : 'Unknown Sender';

          console.log(`✅ Message ${msg.id}: "${subject}" from ${from}`);

          return {
            id: msg.id,
            snippet: full.data.snippet || '',
            subject,
            from,
            internalDate: full.data.internalDate || null,
            threadId: full.data.threadId
          };
        } catch (msgError) {
          console.error(`❌ Error fetching message ${msg.id}:`, msgError.message);
          return {
            id: msg.id,
            snippet: 'Error loading message',
            subject: 'Error loading subject',
            from: 'Unknown',
            internalDate: null,
            threadId: msg.threadId
          };
        }
      })
    );

    console.log(`✅ Successfully fetched ${emails.length} emails`);
    res.json({ emails });
  } catch (err) {
    console.error('❌ Gmail fetch error:', {
      message: err.message,
      code: err.code,
      status: err.status,
      stack: err.stack
    });
    
    // Handle specific Google API errors
    if (err.code === 401) {
      return res.status(401).json({ error: 'Gmail authentication failed. Please re-authenticate.' });
    }
    
    if (err.code === 403) {
      return res.status(403).json({ error: 'Gmail access forbidden. Please check API permissions.' });
    }
    
    if (err.code === 429) {
      return res.status(429).json({ error: 'Gmail API rate limit exceeded. Please try again later.' });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch emails',
      details: err.message,
      code: err.code
    });
  }
});

export default router;
