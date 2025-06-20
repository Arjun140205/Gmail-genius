import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3500';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const savedEmailsApi = {
  getSaved: () => api.get('/api/saved-emails'),
  saveEmail: (emailData) => api.post('/api/saved-emails', emailData),
  unsaveEmail: (emailId) => api.delete(`/api/saved-emails/${emailId}`),
  checkSavedStatus: (emailId) => api.get(`/api/saved-emails/${emailId}/status`)
};

export const suggestionsApi = {
  matchSkills: (data) => api.post('/api/suggestions/match', data),
  generateSuggestions: (data) => api.post('/api/suggestions/generate', data)
};

export default api;
