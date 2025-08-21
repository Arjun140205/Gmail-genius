// client/src/services/gmailApiService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class GmailApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Unauthorized - redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Fetch emails with pagination and filtering
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (1-based)
   * @param {number} params.limit - Number of emails per page
   * @param {string} params.query - Gmail search query
   * @param {Array<string>} params.labelIds - Gmail label IDs to filter by
   * @param {boolean} params.includeSpamTrash - Include spam and trash
   * @returns {Promise<Object>} Paginated email response
   */
  async getEmails(params = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        query = '',
        labelIds = ['INBOX'],
        includeSpamTrash = false
      } = params;

      const response = await this.client.get('/api/gmail/emails', {
        params: {
          page,
          limit,
          query,
          labelIds: Array.isArray(labelIds) ? labelIds.join(',') : labelIds,
          includeSpamTrash
        }
      });

      return {
        emails: response.data.emails || [],
        totalCount: response.data.totalCount || 0,
        totalPages: response.data.totalPages || 0,
        currentPage: response.data.currentPage || page,
        hasNextPage: response.data.hasNextPage || false,
        hasPrevPage: response.data.hasPrevPage || false
      };
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch emails. Please try again.'
      );
    }
  }

  /**
   * Get detailed information for a specific email
   * @param {string} emailId - Gmail message ID
   * @returns {Promise<Object>} Detailed email data
   */
  async getEmailById(emailId) {
    try {
      if (!emailId) {
        throw new Error('Email ID is required');
      }

      console.log('🔍 Fetching email details for ID:', emailId);
      const response = await this.client.get(`/api/gmail/email/${emailId}`);
      console.log('✅ Email details response:', response.data);
      
      // The server returns { email: emailData }, so we need to return the email property
      return response.data.email || response.data;
    } catch (error) {
      console.error('❌ Error fetching email details:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch email details. Please try again.'
      );
    }
  }

  /**
   * Search emails with advanced Gmail search syntax
   * @param {string} searchQuery - Gmail search query
   * @param {Object} options - Additional search options
   * @returns {Promise<Object>} Search results
   */
  async searchEmails(searchQuery, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        labelIds = [],
        maxResults = 100
      } = options;

      const response = await this.client.get('/api/gmail/search', {
        params: {
          q: searchQuery,
          page,
          limit,
          labelIds: Array.isArray(labelIds) ? labelIds.join(',') : labelIds,
          maxResults
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error searching emails:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to search emails. Please try again.'
      );
    }
  }

  /**
   * Get user's Gmail labels
   * @returns {Promise<Array>} List of Gmail labels
   */
  async getLabels() {
    try {
      const response = await this.client.get('/api/gmail/labels');
      return response.data.labels || [];
    } catch (error) {
      console.error('Error fetching labels:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch labels. Please try again.'
      );
    }
  }

  /**
   * Get email statistics and analytics
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Email analytics data
   */
  async getEmailAnalytics(filters = {}) {
    try {
      const response = await this.client.get('/api/gmail/analytics', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching email analytics:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch email analytics. Please try again.'
      );
    }
  }

  /**
   * Batch process emails for AI analysis
   * @param {Array<string>} emailIds - Array of email IDs
   * @param {Object} resumeData - User's resume data
   * @returns {Promise<Object>} Batch analysis results
   */
  async batchAnalyzeEmails(emailIds, resumeData) {
    try {
      if (!Array.isArray(emailIds) || emailIds.length === 0) {
        throw new Error('Email IDs array is required');
      }

      const response = await this.client.post('/api/gmail/batch-analyze', {
        emailIds,
        resumeData
      });

      return response.data;
    } catch (error) {
      console.error('Error in batch email analysis:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to analyze emails. Please try again.'
      );
    }
  }

  /**
   * Mark email as read/unread
   * @param {string} emailId - Gmail message ID
   * @param {boolean} isRead - Whether to mark as read (true) or unread (false)
   * @returns {Promise<Object>} Operation result
   */
  async markEmailAsRead(emailId, isRead = true) {
    try {
      const response = await this.client.patch(`/api/gmail/email/${emailId}/read`, {
        isRead
      });
      return response.data;
    } catch (error) {
      console.error('Error marking email as read:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to update email status. Please try again.'
      );
    }
  }

  /**
   * Add or remove labels from an email
   * @param {string} emailId - Gmail message ID
   * @param {Array<string>} addLabels - Labels to add
   * @param {Array<string>} removeLabels - Labels to remove
   * @returns {Promise<Object>} Operation result
   */
  async modifyEmailLabels(emailId, addLabels = [], removeLabels = []) {
    try {
      const response = await this.client.patch(`/api/gmail/email/${emailId}/labels`, {
        addLabels,
        removeLabels
      });
      return response.data;
    } catch (error) {
      console.error('Error modifying email labels:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to modify email labels. Please try again.'
      );
    }
  }

  /**
   * Get user's Gmail profile information
   * @returns {Promise<Object>} Gmail profile data
   */
  async getProfile() {
    try {
      const response = await this.client.get('/api/gmail/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching Gmail profile:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch Gmail profile. Please try again.'
      );
    }
  }

  /**
   * Check Gmail API connection status
   * @returns {Promise<Object>} Connection status
   */
  async checkConnection() {
    try {
      const response = await this.client.get('/api/gmail/status');
      return response.data;
    } catch (error) {
      console.error('Error checking Gmail connection:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to check Gmail connection. Please try again.'
      );
    }
  }

  /**
   * Get suggested search queries based on user's resume
   * @param {Object} resumeData - User's resume data
   * @returns {Promise<Array>} Suggested search queries
   */
  async getSuggestedSearches(resumeData) {
    try {
      const response = await this.client.post('/api/gmail/suggested-searches', {
        resumeData
      });
      return response.data.suggestions || [];
    } catch (error) {
      console.error('Error fetching suggested searches:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch suggested searches. Please try again.'
      );
    }
  }

  /**
   * Export emails data
   * @param {Object} filters - Export filters
   * @param {string} format - Export format ('json', 'csv', 'pdf')
   * @returns {Promise<Blob>} Exported data blob
   */
  async exportEmails(filters = {}, format = 'json') {
    try {
      const response = await this.client.post('/api/gmail/export', {
        filters,
        format
      }, {
        responseType: 'blob'
      });

      return response.data;
    } catch (error) {
      console.error('Error exporting emails:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to export emails. Please try again.'
      );
    }
  }

  /**
   * Get email thread information
   * @param {string} threadId - Gmail thread ID
   * @returns {Promise<Object>} Thread data with all messages
   */
  async getEmailThread(threadId) {
    try {
      const response = await this.client.get(`/api/gmail/thread/${threadId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching email thread:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch email thread. Please try again.'
      );
    }
  }

  /**
   * Get email attachment information
   * @param {string} emailId - Gmail message ID
   * @param {string} attachmentId - Attachment ID
   * @returns {Promise<Object>} Attachment data
   */
  async getAttachment(emailId, attachmentId) {
    try {
      const response = await this.client.get(
        `/api/gmail/email/${emailId}/attachment/${attachmentId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching attachment:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch attachment. Please try again.'
      );
    }
  }
}

// Create and export a singleton instance
export const gmailApiService = new GmailApiService();
export default gmailApiService;
