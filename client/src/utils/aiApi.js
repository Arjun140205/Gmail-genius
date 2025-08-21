// client/src/utils/aiApi.js
import axios from 'axios';

const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-domain.com/api'
  : 'http://localhost:3500/api';

const aiApi = axios.create({
  baseURL: `${API_BASE}/ai`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * AI API Service for enhanced functionality
 */
export const aiApiService = {
  /**
   * Analyze resume with AI
   */
  analyzeResume: async (resumeText) => {
    try {
      const response = await aiApi.post('/analyze-resume', {
        resumeText
      });
      return response.data;
    } catch (error) {
      console.error('AI resume analysis failed:', error);
      throw error;
    }
  },

  /**
   * Analyze email with AI
   */
  analyzeEmail: async (subject, body, snippet) => {
    try {
      const response = await aiApi.post('/analyze-email', {
        subject,
        body,
        snippet
      });
      return response.data;
    } catch (error) {
      console.error('AI email analysis failed:', error);
      throw error;
    }
  },

  /**
   * Generate smart suggestions by comparing resume and email
   */
  generateSmartSuggestions: async (resumeData, emailData) => {
    try {
      const response = await aiApi.post('/smart-suggestions', {
        resumeData,
        emailData
      });
      return response.data;
    } catch (error) {
      console.error('Smart suggestions failed:', error);
      throw error;
    }
  },

  /**
   * Batch analyze all emails from Gmail
   */
  batchAnalyzeEmails: async (resumeData) => {
    try {
      const response = await aiApi.post('/batch-analyze', {
        resumeData
      });
      return response.data;
    } catch (error) {
      console.error('Batch email analysis failed:', error);
      throw error;
    }
  }
};

export default aiApiService;
