// routes/aiRoutes.js
import express from 'express';
import { 
  analyzeResume, 
  analyzeEmail, 
  generateSmartSuggestions, 
  batchAnalyzeEmails,
  analyzeJobMatch
} from '../controllers/ai.controller.js';
import { isAuthenticated } from '../config/passportConfig.js';

const router = express.Router();

// AI-powered resume analysis
router.post('/analyze-resume', analyzeResume);

// AI-powered email analysis
router.post('/analyze-email', analyzeEmail);

// AI-powered job match analysis
router.post('/analyze-job-match', analyzeJobMatch);

// AI-powered skill gap analysis and smart suggestions
router.post('/smart-suggestions', generateSmartSuggestions);

// Batch analyze emails from Gmail (requires authentication)
router.post('/batch-analyze', isAuthenticated, batchAnalyzeEmails);

export default router;
