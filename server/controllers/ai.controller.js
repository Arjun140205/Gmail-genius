// controllers/ai.controller.js
import aiService from '../services/aiService.js';
import { google } from 'googleapis';

/**
 * AI-powered resume analysis
 */
export const analyzeResume = async (req, res) => {
  try {
    const { resumeText } = req.body;
    
    if (!resumeText) {
      return res.status(400).json({ 
        success: false,
        message: 'Resume text is required' 
      });
    }

    console.log('🤖 Starting AI resume analysis...');
    const analysis = await aiService.parseResume(resumeText);
    
    console.log('✅ Resume analysis complete');
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('❌ Resume analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze resume',
      error: error.message
    });
  }
};

/**
 * AI-powered email analysis
 */
export const analyzeEmail = async (req, res) => {
  try {
    const { subject, body, snippet } = req.body;
    
    if (!subject && !body && !snippet) {
      return res.status(400).json({ 
        success: false,
        message: 'Email content is required' 
      });
    }

    console.log('🤖 Starting AI email analysis...');
    const emailContent = body || snippet || '';
    const analysis = await aiService.parseJobEmail(subject, emailContent);
    
    console.log('✅ Email analysis complete');
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('❌ Email analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze email',
      error: error.message
    });
  }
};

/**
 * AI-powered skill gap analysis and matching
 */
export const generateSmartSuggestions = async (req, res) => {
  try {
    const { resumeData, emailData } = req.body;
    
    if (!resumeData || !emailData) {
      return res.status(400).json({ 
        success: false,
        message: 'Both resume data and email data are required' 
      });
    }

    console.log('🤖 Starting AI skill gap analysis...');
    const analysis = await aiService.compareAndAnalyze(resumeData, emailData);
    
    console.log('✅ Smart suggestions generated');
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('❌ Smart suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate smart suggestions',
      error: error.message
    });
  }
};

/**
 * Batch analyze multiple emails from Gmail
 */
export const batchAnalyzeEmails = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    const { resumeData } = req.body;
    
    if (!resumeData) {
      return res.status(400).json({ 
        success: false,
        message: 'Resume data is required for comparison' 
      });
    }

    console.log('📧 Fetching emails from Gmail...');
    
    // Set up Gmail API
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: req.user.accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Fetch recent emails
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
      q: 'in:inbox (internship OR job OR position OR opportunity OR hiring)'
    });

    const messages = response.data.messages || [];
    
    if (messages.length === 0) {
      return res.json({
        success: true,
        data: {
          analyzedEmails: [],
          summary: 'No relevant emails found'
        }
      });
    }

    console.log(`🤖 Analyzing ${messages.length} emails with AI...`);
    
    const analyzedEmails = [];
    
    for (const message of messages) {
      try {
        // Get full email content
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });

        const headers = email.data.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        const snippet = email.data.snippet || '';

        // AI-powered email analysis
        const emailAnalysis = await aiService.parseJobEmail(subject, snippet);
        
        // Only analyze relevant emails
        if (emailAnalysis.isRelevant && emailAnalysis.relevanceScore > 50) {
          // AI-powered comparison with resume
          const comparison = await aiService.compareAndAnalyze(resumeData, emailAnalysis);
          
          analyzedEmails.push({
            id: message.id,
            subject,
            snippet,
            emailAnalysis,
            matchAnalysis: comparison,
            timestamp: email.data.internalDate
          });
        }
        
        // Add delay to respect API limits
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (emailError) {
        console.error(`Error analyzing email ${message.id}:`, emailError.message);
      }
    }

    // Sort by match percentage
    analyzedEmails.sort((a, b) => b.matchAnalysis.matchPercentage - a.matchAnalysis.matchPercentage);

    console.log(`✅ Batch analysis complete. ${analyzedEmails.length} relevant opportunities found`);
    
    res.json({
      success: true,
      data: {
        analyzedEmails,
        summary: {
          totalEmails: messages.length,
          relevantEmails: analyzedEmails.length,
          avgMatchScore: analyzedEmails.length > 0 
            ? analyzedEmails.reduce((sum, email) => sum + email.matchAnalysis.matchPercentage, 0) / analyzedEmails.length 
            : 0,
          topMatches: analyzedEmails.slice(0, 3)
        }
      }
    });
  } catch (error) {
    console.error('❌ Batch email analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze emails',
      error: error.message
    });
  }
};

/**
 * AI-powered job match analysis
 */
export const analyzeJobMatch = async (req, res) => {
  try {
    const { resumeData, emailContent, options = {} } = req.body;
    
    if (!resumeData || !emailContent) {
      return res.status(400).json({ 
        success: false,
        message: 'Resume data and email content are required' 
      });
    }

    console.log('🤖 Starting AI job match analysis...');
    
    // First, analyze the email to extract job information
    const emailAnalysis = await aiService.parseJobEmail(emailContent.subject, emailContent.body || emailContent.snippet);
    
    // Then compare resume with the extracted job data
    const matchAnalysis = await aiService.compareAndAnalyze(resumeData, {
      jobTitle: emailAnalysis.jobTitle || 'Unknown Position',
      company: emailAnalysis.company || 'Unknown Company',
      requirements: emailAnalysis.requirements || [],
      content: emailContent
    });
    
    console.log('✅ Job match analysis complete');
    res.json({
      success: true,
      jobDetails: {
        jobTitle: emailAnalysis.jobTitle,
        company: emailAnalysis.company,
        requirements: emailAnalysis.requirements
      },
      matchPercentage: matchAnalysis.matchPercentage || 0,
      confidence: matchAnalysis.confidenceLevel === 'high' ? 90 : matchAnalysis.confidenceLevel === 'medium' ? 70 : 50,
      matchedSkills: matchAnalysis.matchedSkills || [],
      missingSkills: matchAnalysis.missingSkills || [],
      recommendations: matchAnalysis.recommendations || [],
      analysis: {
        summary: matchAnalysis.summary || 'Analysis completed',
        shouldApply: matchAnalysis.shouldApply || false,
        strengthsToHighlight: matchAnalysis.strengthsToHighlight || [],
        applicationTips: matchAnalysis.applicationTips || []
      }
    });
  } catch (error) {
    console.error('❌ Job match analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze job match',
      error: error.message
    });
  }
};
