// client/src/services/aiApiService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class AiApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      timeout: 60000, // 60 seconds for AI operations
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Add request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Parse resume file and extract structured data
   * @param {File} file - Resume file (PDF, DOC, DOCX, TXT)
   * @returns {Promise<Object>} Parsed resume data
   */
  async parseResume(file) {
    try {
      if (!file) {
        throw new Error('Resume file is required');
      }

      const formData = new FormData();
      formData.append('resume', file);

      const response = await this.client.post('/api/ai/parse-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 90000, // 90 seconds for file processing
      });

      return {
        success: true,
        data: response.data,
        skills: response.data.skills || [],
        experience: response.data.experience || [],
        education: response.data.education || [],
        summary: response.data.summary || '',
        contact: response.data.contact || {}
      };
    } catch (error) {
      console.error('Error parsing resume:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to parse resume. Please try again with a different format.'
      );
    }
  }

  /**
   * Analyze job match between resume and email content
   * @param {Object} resumeData - Parsed resume data
   * @param {string} emailContent - Email content to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Job match analysis
   */
  async analyzeJobMatch(resumeData, emailContent, options = {}) {
    try {
      if (!resumeData || !emailContent) {
        throw new Error('Resume data and email content are required');
      }

      const {
        includeRecommendations = true,
        detailedAnalysis = true,
        skillMapping = true
      } = options;

      const response = await this.client.post('/api/ai/analyze-job-match', {
        resumeData,
        emailContent,
        options: {
          includeRecommendations,
          detailedAnalysis,
          skillMapping
        }
      });

      return {
        success: true,
        matchPercentage: response.data.matchPercentage || 0,
        matchedSkills: response.data.matchedSkills || [],
        missingSkills: response.data.missingSkills || [],
        recommendations: response.data.recommendations || [],
        analysis: response.data.analysis || {},
        confidence: response.data.confidence || 0,
        jobDetails: response.data.jobDetails || {}
      };
    } catch (error) {
      console.error('Error analyzing job match:', error);
      // Return a default response instead of throwing
      return {
        success: false,
        matchPercentage: 0,
        matchedSkills: [],
        missingSkills: [],
        recommendations: [],
        analysis: {},
        confidence: 0,
        error: error.response?.data?.message || 'Analysis failed'
      };
    }
  }

  /**
   * Extract job requirements from email content
   * @param {string} emailContent - Email content
   * @returns {Promise<Object>} Extracted job requirements
   */
  async extractJobRequirements(emailContent) {
    try {
      if (!emailContent) {
        throw new Error('Email content is required');
      }

      const response = await this.client.post('/api/ai/extract-job-requirements', {
        emailContent
      });

      return {
        success: true,
        requirements: response.data.requirements || {},
        skills: response.data.skills || [],
        experience: response.data.experience || '',
        qualifications: response.data.qualifications || [],
        jobTitle: response.data.jobTitle || '',
        company: response.data.company || '',
        location: response.data.location || '',
        salary: response.data.salary || '',
        benefits: response.data.benefits || []
      };
    } catch (error) {
      console.error('Error extracting job requirements:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to extract job requirements. Please try again.'
      );
    }
  }

  /**
   * Generate resume improvement suggestions
   * @param {Object} resumeData - Current resume data
   * @param {Array} jobRequirements - Array of job requirements from analyzed emails
   * @returns {Promise<Object>} Resume improvement suggestions
   */
  async generateResumeSuggestions(resumeData, jobRequirements = []) {
    try {
      if (!resumeData) {
        throw new Error('Resume data is required');
      }

      const response = await this.client.post('/api/ai/resume-suggestions', {
        resumeData,
        jobRequirements
      });

      return {
        success: true,
        suggestions: response.data.suggestions || [],
        skillGaps: response.data.skillGaps || [],
        improvementAreas: response.data.improvementAreas || [],
        industryTrends: response.data.industryTrends || [],
        recommendedCourses: response.data.recommendedCourses || []
      };
    } catch (error) {
      console.error('Error generating resume suggestions:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to generate resume suggestions. Please try again.'
      );
    }
  }

  /**
   * Generate cover letter based on resume and job description
   * @param {Object} resumeData - Resume data
   * @param {string} jobDescription - Job description from email
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated cover letter
   */
  async generateCoverLetter(resumeData, jobDescription, options = {}) {
    try {
      if (!resumeData || !jobDescription) {
        throw new Error('Resume data and job description are required');
      }

      const {
        tone = 'professional',
        length = 'medium',
        includePersonalTouch = true
      } = options;

      const response = await this.client.post('/api/ai/generate-cover-letter', {
        resumeData,
        jobDescription,
        options: {
          tone,
          length,
          includePersonalTouch
        }
      });

      return {
        success: true,
        coverLetter: response.data.coverLetter || '',
        keyPoints: response.data.keyPoints || [],
        personalizations: response.data.personalizations || []
      };
    } catch (error) {
      console.error('Error generating cover letter:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to generate cover letter. Please try again.'
      );
    }
  }

  /**
   * Batch analyze multiple emails
   * @param {Array} emails - Array of email objects
   * @param {Object} resumeData - Resume data
   * @returns {Promise<Object>} Batch analysis results
   */
  async batchAnalyzeEmails(emails, resumeData) {
    try {
      if (!Array.isArray(emails) || emails.length === 0) {
        throw new Error('Emails array is required');
      }

      if (!resumeData) {
        throw new Error('Resume data is required');
      }

      const response = await this.client.post('/api/ai/batch-analyze', {
        emails: emails.slice(0, 50), // Limit to 50 emails per batch
        resumeData
      }, {
        timeout: 180000 // 3 minutes for batch processing
      });

      return {
        success: true,
        results: response.data.results || [],
        summary: response.data.summary || {},
        topMatches: response.data.topMatches || [],
        analytics: response.data.analytics || {}
      };
    } catch (error) {
      console.error('Error in batch analysis:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to analyze emails in batch. Please try again.'
      );
    }
  }

  /**
   * Get skill trend analysis
   * @param {Array} skills - Array of skills
   * @param {string} industry - Industry context
   * @returns {Promise<Object>} Skill trend data
   */
  async getSkillTrends(skills, industry = '') {
    try {
      const response = await this.client.post('/api/ai/skill-trends', {
        skills,
        industry
      });

      return {
        success: true,
        trends: response.data.trends || [],
        demandScore: response.data.demandScore || {},
        recommendations: response.data.recommendations || [],
        futureOutlook: response.data.futureOutlook || {}
      };
    } catch (error) {
      console.error('Error fetching skill trends:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch skill trends. Please try again.'
      );
    }
  }

  /**
   * Generate interview preparation questions
   * @param {Object} resumeData - Resume data
   * @param {string} jobDescription - Job description
   * @returns {Promise<Object>} Interview questions and tips
   */
  async generateInterviewPrep(resumeData, jobDescription) {
    try {
      if (!resumeData || !jobDescription) {
        throw new Error('Resume data and job description are required');
      }

      const response = await this.client.post('/api/ai/interview-prep', {
        resumeData,
        jobDescription
      });

      return {
        success: true,
        questions: response.data.questions || [],
        tips: response.data.tips || [],
        commonQuestions: response.data.commonQuestions || [],
        technicalQuestions: response.data.technicalQuestions || [],
        behavioralQuestions: response.data.behavioralQuestions || []
      };
    } catch (error) {
      console.error('Error generating interview prep:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to generate interview preparation. Please try again.'
      );
    }
  }

  /**
   * Analyze email sentiment and urgency
   * @param {string} emailContent - Email content to analyze
   * @returns {Promise<Object>} Sentiment and urgency analysis
   */
  async analyzeEmailSentiment(emailContent) {
    try {
      if (!emailContent) {
        throw new Error('Email content is required');
      }

      const response = await this.client.post('/api/ai/email-sentiment', {
        emailContent
      });

      return {
        success: true,
        sentiment: response.data.sentiment || 'neutral',
        confidence: response.data.confidence || 0,
        urgency: response.data.urgency || 'low',
        keywords: response.data.keywords || [],
        summary: response.data.summary || ''
      };
    } catch (error) {
      console.error('Error analyzing email sentiment:', error);
      return {
        success: false,
        sentiment: 'neutral',
        confidence: 0,
        urgency: 'low',
        keywords: [],
        error: error.response?.data?.message || 'Analysis failed'
      };
    }
  }

  /**
   * Get AI service status and available models
   * @returns {Promise<Object>} Service status
   */
  async getServiceStatus() {
    try {
      const response = await this.client.get('/api/ai/status');
      return {
        success: true,
        status: response.data.status || 'unknown',
        availableModels: response.data.availableModels || [],
        activeModel: response.data.activeModel || '',
        features: response.data.features || []
      };
    } catch (error) {
      console.error('Error fetching AI service status:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch service status. Please try again.'
      );
    }
  }

  /**
   * Generate personalized email responses
   * @param {string} emailContent - Original email content
   * @param {Object} resumeData - User's resume data
   * @param {string} responseType - Type of response ('inquiry', 'application', 'follow-up')
   * @returns {Promise<Object>} Generated email response
   */
  async generateEmailResponse(emailContent, resumeData, responseType = 'inquiry') {
    try {
      const response = await this.client.post('/api/ai/generate-response', {
        emailContent,
        resumeData,
        responseType
      });

      return {
        success: true,
        response: response.data.response || '',
        subject: response.data.subject || '',
        tone: response.data.tone || 'professional',
        keyPoints: response.data.keyPoints || []
      };
    } catch (error) {
      console.error('Error generating email response:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to generate email response. Please try again.'
      );
    }
  }
}

// Create and export singleton instance
export const aiApiService = new AiApiService();
export default aiApiService;
