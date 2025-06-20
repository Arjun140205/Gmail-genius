import express from 'express';
import { saveEmail, unsaveEmail, getSavedEmails, isEmailSaved } from '../controllers/savedEmail.controller.js';
import { isAuthenticated } from '../config/passportConfig.js';

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Save an email
router.post('/', saveEmail);

// Unsave an email
router.delete('/:emailId', unsaveEmail);

// Get all saved emails
router.get('/', getSavedEmails);

// Check if an email is saved
router.get('/:emailId/status', isEmailSaved);

export default router;
