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

    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const query = req.query.q || ''; // Search query
    const labelIds = req.query.labelIds || ['INBOX'];
    
    console.log('📊 Pagination params:', { page, limit, query, labelIds });

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
    
    // Build search query
    let searchQuery = query;
    if (!query) {
      // Default to all emails in the last year if no specific query
      searchQuery = 'in:inbox OR in:sent';
    }
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: limit,
      q: searchQuery,
      labelIds: Array.isArray(labelIds) ? labelIds : [labelIds],
      pageToken: req.query.pageToken // For pagination
    });

    console.log('📊 Messages list response:', {
      resultSizeEstimate: response.data.resultSizeEstimate,
      messagesCount: response.data.messages?.length || 0,
      nextPageToken: response.data.nextPageToken
    });

    const messages = response.data.messages || [];

    if (messages.length === 0) {
      console.log('📭 No messages found');
      return res.json({ 
        emails: [], 
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          nextPageToken: null
        }
      });
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
          
          const dateHeader = findHeader(full.data.payload, 'date');
          const date = dateHeader ? dateHeader.value : null;
          
          const toHeader = findHeader(full.data.payload, 'to');
          const to = toHeader ? toHeader.value : '';

          // Extract email body
          let body = '';
          const extractBody = (payload) => {
            if (payload.body && payload.body.data) {
              return Buffer.from(payload.body.data, 'base64').toString('utf-8');
            }
            if (payload.parts) {
              for (const part of payload.parts) {
                if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
                  const partBody = extractBody(part);
                  if (partBody) return partBody;
                }
              }
            }
            return '';
          };
          
          body = extractBody(full.data.payload) || full.data.snippet || '';

          // Determine email labels and categories
          const labels = full.data.labelIds || [];
          const isImportant = labels.includes('IMPORTANT');
          const isUnread = labels.includes('UNREAD');
          const category = labels.find(l => l.startsWith('CATEGORY_')) || 'PRIMARY';

          console.log(`✅ Message ${msg.id}: "${subject}" from ${from}`);

          return {
            id: msg.id,
            snippet: full.data.snippet || '',
            subject,
            from,
            to,
            date,
            body: body.substring(0, 5000), // Limit body size
            internalDate: full.data.internalDate || null,
            threadId: full.data.threadId,
            labels,
            isImportant,
            isUnread,
            category: category.replace('CATEGORY_', '').toLowerCase(),
            sizeEstimate: full.data.sizeEstimate || 0
          };
        } catch (msgError) {
          console.error(`❌ Error fetching message ${msg.id}:`, msgError.message);
          return {
            id: msg.id,
            snippet: 'Error loading message',
            subject: 'Error loading subject',
            from: 'Unknown',
            to: '',
            date: null,
            body: '',
            internalDate: null,
            threadId: msg.threadId,
            labels: [],
            isImportant: false,
            isUnread: false,
            category: 'primary',
            sizeEstimate: 0
          };
        }
      })
    );

    console.log(`✅ Successfully fetched ${emails.length} emails`);
    
    // Calculate pagination info
    const totalEstimate = response.data.resultSizeEstimate || 0;
    const totalPages = Math.ceil(totalEstimate / limit);
    
    res.json({ 
      emails,
      pagination: {
        page,
        limit,
        total: totalEstimate,
        totalPages,
        nextPageToken: response.data.nextPageToken || null,
        hasMore: !!response.data.nextPageToken
      }
    });
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

// Get detailed email information
router.get('/email/:id', async (req, res) => {
  console.log('🔍 Gmail email detail endpoint hit for ID:', req.params.id);
  
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    oauth2Client.setCredentials({
      access_token: req.user.accessToken,
      refresh_token: req.user.refreshToken
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    const emailData = await gmail.users.messages.get({
      userId: 'me',
      id: req.params.id,
      format: 'full'
    });

    const message = emailData.data;
    const payload = message.payload;

    // Extract all headers
    const headers = {};
    if (payload.headers) {
      payload.headers.forEach(header => {
        headers[header.name.toLowerCase()] = header.value;
      });
    }

    // Extract email body (full version)
    let body = '';
    let htmlBody = '';
    
    const extractContent = (payload) => {
      if (payload.body && payload.body.data) {
        const content = Buffer.from(payload.body.data, 'base64').toString('utf-8');
        if (payload.mimeType === 'text/plain') {
          body = content;
        } else if (payload.mimeType === 'text/html') {
          htmlBody = content;
        }
      }
      
      if (payload.parts) {
        payload.parts.forEach(part => {
          extractContent(part);
        });
      }
    };
    
    extractContent(payload);

    // Get thread information
    let threadEmails = [];
    if (message.threadId) {
      try {
        const threadData = await gmail.users.threads.get({
          userId: 'me',
          id: message.threadId
        });
        threadEmails = threadData.data.messages || [];
      } catch (threadError) {
        console.log('Could not fetch thread data:', threadError.message);
      }
    }

    const detailedEmail = {
      id: message.id,
      threadId: message.threadId,
      subject: headers.subject || '(No Subject)',
      from: headers.from || 'Unknown Sender',
      to: headers.to || '',
      cc: headers.cc || '',
      bcc: headers.bcc || '',
      date: headers.date || '',
      replyTo: headers['reply-to'] || '',
      body: body || message.snippet || '',
      htmlBody,
      snippet: message.snippet || '',
      labels: message.labelIds || [],
      isImportant: (message.labelIds || []).includes('IMPORTANT'),
      isUnread: (message.labelIds || []).includes('UNREAD'),
      sizeEstimate: message.sizeEstimate || 0,
      internalDate: message.internalDate,
      threadLength: threadEmails.length,
      headers: headers
    };

    res.json({ email: detailedEmail });
    
  } catch (error) {
    console.error('❌ Error fetching email details:', error.message);
    res.status(500).json({ error: 'Failed to fetch email details' });
  }
});

export default router;
