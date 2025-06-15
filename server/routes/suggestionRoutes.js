// routes/suggestionRoutes.js
import express from 'express';
import { generateSuggestions, matchSuggestions } from '../controllers/suggestion.controller.js';

const router = express.Router();

router.post('/generate', generateSuggestions);
router.post('/match', matchSuggestions);

export default router;