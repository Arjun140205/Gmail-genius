// server/passportConfig.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();

// Authentication middleware
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

// Authentication error handler
export const handleAuthError = (err, req, res, next) => {
  res.status(401).json({ message: 'Authentication error', error: err.message });
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log('🔑 OAuth tokens received:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        profileId: profile.id,
        displayName: profile.displayName
      });
      
      // Attach tokens to user profile for later API calls
      const userWithToken = {
        ...profile,
        accessToken,
        refreshToken, // Store refresh token for token renewal
      };
      return done(null, userWithToken);
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;
