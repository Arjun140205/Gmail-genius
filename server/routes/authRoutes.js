import express from 'express';
import passport from '../config/passportConfig.js';

const router = express.Router();

// Step 1: Redirect to Google for authentication
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'],
    accessType: 'offline',
    prompt: 'consent',
  })
);

// Step 2: Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/failure' }),
  (req, res) => {
    // Redirect to frontend after successful login
    res.redirect('http://localhost:3000');
  }
);

// Authentication failed
router.get('/failure', (req, res) => {
  res.status(401).send('❌ Authentication failed');
});

// Logout route - responds with JSON instead of redirect
router.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    res.json({ message: 'Logged out successfully' });
  });
});

// Send logged-in user info to frontend
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ user: null });
  }
});

export default router;
